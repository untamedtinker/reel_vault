/* ==========================================================================
   TOOLBAR ACTION POPUP CONTROLLER
   Scope: Extension Quick Access View (pages/popup.html)
   Description: Manages quick sync initiation, live progress messaging,
   storage metrics preview, and navigation triggers to the dashboard.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const openVaultBtn = document.getElementById('openVaultBtn');
  const statusEl = document.getElementById('status');
  const lastSyncInfoEl = document.getElementById('lastSyncInfo');

  /**
   * Reads persistent local storage metrics to display reel and folder counts.
   */
  function refreshVaultStats() {
    chrome.storage.local.get(['vaultData', 'lastSyncedAt'], (result) => {
      if (result.vaultData && Array.isArray(result.vaultData)) {
        const totalReels = result.vaultData.reduce((acc, col) => acc + (col.items ? col.items.length : 0), 0);
        const totalFolders = result.vaultData.length;
        const dateStr = result.lastSyncedAt ? new Date(result.lastSyncedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';
        lastSyncInfoEl.innerText = `${totalReels} reels in ${totalFolders} folders (${dateStr})`;
      } else {
        lastSyncInfoEl.innerText = "No sync yet. Click 'Sync' to begin.";
      }
    });
  }

  refreshVaultStats();

  const syncCompleteBanner = document.getElementById('syncCompleteBanner');
  const openDashboardFromBanner = document.getElementById('openDashboardFromBanner');

  function openDashboardAndClose() {
    chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" }, () => {
      window.close();
    });
  }

  // Open Vault in a tab
  openVaultBtn.addEventListener('click', openDashboardAndClose);
  if (openDashboardFromBanner) {
    openDashboardFromBanner.addEventListener('click', openDashboardAndClose);
  }

  // Launch sync process
  startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    if (syncCompleteBanner) syncCompleteBanner.style.display = 'none';
    statusEl.innerText = "Syncing...";
    statusEl.className = "status-badge syncing";

    const pulse = document.querySelector('.pulse-indicator');
    if (pulse) {
      pulse.style.background = "#f59e0b";
      pulse.style.boxShadow = "0 0 8px rgba(245, 158, 11, 0.6)";
    }

    chrome.runtime.sendMessage({ action: "LAUNCH_ISOLATED_WINDOW" }, (response) => {
      statusEl.innerText = "Syncing in background...";
    });
  });

  // Listen for sync completion and progress from background worker
  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "SCRAPE_PROGRESS") {
        if (msg.text) {
          statusEl.innerText = "Syncing...";
          lastSyncInfoEl.innerHTML = msg.text;
        }
      } else if (msg.type === "AUTH_REQUIRED") {
        startBtn.disabled = false;
        statusEl.innerText = "Log In Needed";
        statusEl.className = "status-badge auth-required";
        lastSyncInfoEl.innerHTML = '<span style="color: #f87171;">Please log into Instagram in your browser, then click Sync again.</span>';

        const pulse = document.querySelector('.pulse-indicator');
        if (pulse) {
          pulse.style.background = "#ef4444";
          pulse.style.boxShadow = "0 0 8px rgba(239, 68, 68, 0.6)";
        }
      } else if (msg.type === "VAULT_DATA_UPDATED" && msg.isIntermediate === false) {
        startBtn.disabled = false;
        statusEl.innerText = "Ready";
        statusEl.className = "status-badge ready";

        const pulse = document.querySelector('.pulse-indicator');
        if (pulse) {
          pulse.style.background = "#22c55e";
          pulse.style.boxShadow = "0 0 8px rgba(34, 197, 94, 0.6)";
        }

        refreshVaultStats();
        if (syncCompleteBanner) {
          syncCompleteBanner.style.display = 'flex';
        }
      }
    });
  }
});
