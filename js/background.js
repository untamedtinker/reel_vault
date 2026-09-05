/* ==========================================================================
   BACKGROUND SERVICE WORKER
   Scope: Extension Lifecycle & Background Telemetry (Manifest V3)
   Description: Coordinates headless sync windows, aggregates live crawler telemetry,
   persists vault data into chrome.storage.local, manages OS notifications,
   and handles tab routing to the primary Reel Vault dashboard.
   ========================================================================== */

let workerWindowId = null;

/**
 * Focuses an existing Reel Vault dashboard tab or creates a new one.
 */
function openDashboard() {
  const dashboardUrl = chrome.runtime.getURL("index.html");
  chrome.tabs.query({}, (tabs) => {
    const existingTab = tabs.find(t => t.url && t.url.startsWith(dashboardUrl));
    if (existingTab) {
      chrome.tabs.update(existingTab.id, { active: true });
      if (existingTab.windowId) {
        chrome.windows.update(existingTab.windowId, { focused: true });
      }
    } else {
      chrome.tabs.create({ url: dashboardUrl });
    }
  });
}

/**
 * Performs key-based merging of incoming folder collections into existing storage,
 * deduplicating reels by Instagram shortcode and preserving user collection names.
 */
function mergeCollections(existingCollections, newCollections) {
  if (!Array.isArray(existingCollections) || existingCollections.length === 0) {
    return newCollections || [];
  }
  if (!Array.isArray(newCollections) || newCollections.length === 0) {
    return existingCollections;
  }

  const folderMap = new Map();

  // Populate existing
  for (const col of existingCollections) {
    const fName = col.folderName || "All Posts";
    const itemMap = new Map((col.items || []).map(i => [i.shortcode || i.url, i]));
    folderMap.set(fName, { folderName: fName, folderUrl: col.folderUrl, itemMap });
  }

  // Merge new
  for (const col of newCollections) {
    const fName = col.folderName || "All Posts";
    if (!folderMap.has(fName)) {
      const itemMap = new Map((col.items || []).map(i => [i.shortcode || i.url, i]));
      folderMap.set(fName, { folderName: fName, folderUrl: col.folderUrl, itemMap });
    } else {
      const target = folderMap.get(fName);
      for (const item of (col.items || [])) {
        const key = item.shortcode || item.url;
        target.itemMap.set(key, item);
      }
    }
  }

  return Array.from(folderMap.values()).map(f => ({
    folderName: f.folderName,
    folderUrl: f.folderUrl,
    items: Array.from(f.itemMap.values())
  }));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_DASHBOARD") {
    openDashboard();
    sendResponse({ success: true });
    return false;
  }

  if (message.action === "LAUNCH_ISOLATED_WINDOW") {
    chrome.action.setBadgeText({ text: "SYNC" });
    chrome.action.setBadgeBackgroundColor({ color: "#e1306c" });

    // Retrieve existing data to enable incremental fast-sync
    chrome.storage.local.get(["vaultData"], (res) => {
      const existingVault = res.vaultData || [];

      chrome.windows.create({
        url: "https://www.instagram.com/",
        type: "popup",
        focused: false,
        width: 850,
        height: 750,
        left: 10,
        top: 10
      }, (win) => {
        workerWindowId = win.id;
        const workerTabId = win.tabs[0].id;

        const tabLoadListener = (tabId, changeInfo) => {
          if (tabId === workerTabId && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(tabLoadListener);

            setTimeout(() => {
              chrome.scripting.executeScript({
                target: { tabId: workerTabId },
                files: ['js/content.js']
              }, () => {
                chrome.tabs.sendMessage(workerTabId, {
                  action: "AUTONOMOUS_START",
                  existingData: existingVault
                }).catch(() => {});
              });
            }, 2500);
          }
        };

        chrome.tabs.onUpdated.addListener(tabLoadListener);
      });
    });

    sendResponse({ started: true });
    return false;
  }

  if (message.type === "SCRAPE_PROGRESS") {
    chrome.action.setBadgeText({ text: message.badge || "..." });
    chrome.action.setBadgeBackgroundColor({ color: "#e1306c" });
    chrome.runtime.sendMessage(message).catch(() => {});
    return false;
  }

  // Live real-time streaming updates as each folder finishes
  if (message.type === "STREAM_FOLDER_UPDATE") {
    chrome.storage.local.get(["vaultData", "creatorsVault"], (res) => {
      const mergedData = mergeCollections(res.vaultData, [message.folderData]);
      chrome.storage.local.set({ vaultData: mergedData }, () => {
        chrome.runtime.sendMessage({
          type: "VAULT_DATA_UPDATED",
          data: mergedData,
          creators: res.creatorsVault || [],
          isIntermediate: true
        }).catch(() => {});
      });
    });
    return false;
  }

  // Live real-time streaming updates as creators are discovered and synced
  if (message.type === "STREAM_CREATORS_UPDATE") {
    chrome.storage.local.get(["vaultData", "creatorsVault"], (res) => {
      const existingCreators = res.creatorsVault || [];
      const newCreators = message.creators || [];
      
      const creatorMap = new Map(existingCreators.map(c => [c.authorUsername, c]));
      for (const c of newCreators) {
        if (c.authorUsername) {
          const prev = creatorMap.get(c.authorUsername) || {};
          creatorMap.set(c.authorUsername, { ...prev, ...c });
        }
      }
      const mergedCreators = Array.from(creatorMap.values());

      chrome.storage.local.set({ creatorsVault: mergedCreators }, () => {
        chrome.runtime.sendMessage({
          type: "VAULT_DATA_UPDATED",
          data: res.vaultData || [],
          creators: mergedCreators,
          isIntermediate: true
        }).catch(() => {});
      });
    });
    return false;
  }

  if (message.type === "AUTH_REQUIRED") {
    chrome.action.setBadgeText({ text: "AUTH" });
    chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });

    // Focus/open Instagram login page for user
    chrome.tabs.create({ url: "https://www.instagram.com/accounts/login/" });

    // Close hidden background worker window
    const winIdToClose = sender.tab?.windowId || workerWindowId;
    if (winIdToClose) {
      chrome.windows.remove(winIdToClose).catch(() => {});
      workerWindowId = null;
    }

    chrome.runtime.sendMessage(message).catch(() => {});
    sendResponse({ handled: true });
    return false;
  }

  if (message.type === "EXPORT_DATA") {
    chrome.action.setBadgeText({ text: "DONE" });
    chrome.action.setBadgeBackgroundColor({ color: "#22c55e" });

    chrome.storage.local.get(["vaultData", "creatorsVault"], (res) => {
      // Complete live crawl result replaces stale previous collections, accurately pruning deleted folders
      const finalVaultData = Array.isArray(message.data) && message.data.length > 0
        ? message.data
        : (res.vaultData || []);

      const existingCreators = res.creatorsVault || [];
      const newCreators = message.followingCreators || [];
      
      let mergedCreators = [];
      if (newCreators.length > 0) {
        const prevMap = new Map(existingCreators.map(c => [c.authorUsername, c]));
        mergedCreators = newCreators.map(c => {
          const prev = prevMap.get(c.authorUsername) || {};
          return { ...prev, ...c, isFollowing: true };
        });
      } else {
        mergedCreators = existingCreators;
      }

      // Save in storage for the dashboard
      chrome.storage.local.set({
        vaultData: finalVaultData,
        creatorsVault: mergedCreators,
        lastSyncedAt: new Date().toISOString()
      }, () => {
        chrome.runtime.sendMessage({
          type: "VAULT_DATA_UPDATED",
          data: finalVaultData,
          creators: mergedCreators,
          isIntermediate: false
        }).catch(() => {});

        // Trigger native Chrome / OS desktop notification even if extension popup is closed
        const totalReels = finalVaultData.reduce((acc, col) => acc + (col.items ? col.items.length : 0), 0);
        const iconPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
        
        if (chrome.notifications && chrome.notifications.create) {
          try {
            chrome.notifications.create('sync-complete-' + Date.now(), {
              type: 'basic',
              iconUrl: iconPng,
              title: 'Reel Vault Sync Complete',
              message: `Successfully synced ${totalReels} reels. Click here to open your Dashboard!`,
              priority: 2,
              requireInteraction: true
            }, () => {
              if (chrome.runtime.lastError) {
                // Ignore any system notification delivery errors gracefully
              }
            });
          } catch (e) {}
        }

        // Auto-open or focus the Dashboard tab so the user sees their synced data immediately
        openDashboard();
      });

      const winIdToClose = sender.tab?.windowId || workerWindowId;
      if (winIdToClose) {
        setTimeout(() => {
          chrome.windows.remove(winIdToClose).catch(() => {});
          workerWindowId = null;
        }, 3000);
      }
    });

    sendResponse({ received: true });
    return false;
  }

  if (message.type === "CLOSE_WORKER_WINDOW") {
    const winIdToClose = sender.tab?.windowId || workerWindowId;
    if (winIdToClose) {
      chrome.windows.remove(winIdToClose).catch(() => {});
      workerWindowId = null;
    }
    sendResponse({ closed: true });
    return false;
  }
});

if (chrome.notifications && chrome.notifications.onClicked) {
  chrome.notifications.onClicked.addListener((notificationId) => {
    openDashboard();
    if (chrome.notifications.clear) {
      chrome.notifications.clear(notificationId);
    }
  });
}

