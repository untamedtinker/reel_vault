/* ==========================================================================
   AUTONOMOUS CONTENT SCRAPER & CRAWLER SCRIPT
   Scope: Instagram Context Content Script (Manifest V3)
   Description: Orchestrates automated saved reels extraction, collection discovery,
   creator profile relationship classification, and parallel metadata enrichment.
   ========================================================================== */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "AUTONOMOUS_START") {
    runAutonomousFlow().then(sendResponse);
    return true;
  }
});

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function safeSendMessage(message) {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      return chrome.runtime.sendMessage(message).catch(() => {});
    }
  } catch (e) {}
}

function notify(text, badge = "...") {
  safeSendMessage({ type: "SCRAPE_PROGRESS", text, badge });
}

function sanitizeText(str) {
  if (!str) return "";
  return str.replace(/[\u2028\u2029]/g, "\n").trim();
}

function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

function getBaseHeaders() {
  const csrf = getCsrfToken();
  const headers = {
    'x-ig-app-id': '936619743392459',
    'x-asbd-id': '129477',
    'x-requested-with': 'XMLHttpRequest'
  };
  if (csrf) headers['x-csrftoken'] = csrf;
  return headers;
}

async function detectLoggedInUser() {
  // Strategy 1: Direct Instagram Current User API
  try {
    const res = await fetch('https://www.instagram.com/api/v1/accounts/current_user/?edit=true', {
      headers: getBaseHeaders()
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.user?.username) {
        return {
          username: data.user.username,
          userId: data.user.pk || data.user.id || null
        };
      }
    }
  } catch (e) {}

  // Strategy 2: ds_user_id Cookie
  let dsUserId = null;
  try {
    const dsMatch = document.cookie.match(/ds_user_id=([^;]+)/);
    if (dsMatch) dsUserId = dsMatch[1];
  } catch (e) {}

  // Strategy 3: Profile link in navigation
  const profileLink = document.querySelector('a[href*="/"][role="link"] img[alt*="profile"], svg[aria-label="Profile"]');
  if (profileLink) {
    const anchor = profileLink.closest('a');
    if (anchor) {
      const href = anchor.getAttribute('href');
      if (href) {
        const clean = href.replace(/\//g, '').split('?')[0];
        if (clean && !['explore', 'reels', 'direct', 'stories'].includes(clean.toLowerCase())) {
          return { username: clean, userId: dsUserId };
        }
      }
    }
  }

  return { username: null, userId: dsUserId };
}

// Parses Instagram Alt text for author name and @handle
function parseAuthorFromAlt(altText) {
  if (!altText) return { authorUsername: null, authorFullName: null };

  const matchWithParen = altText.match(/(?:Photo|Video)\s+by\s+([^(@]+)\s*\(@([a-zA-Z0-9_.]+)\)/i);
  if (matchWithParen) {
    return {
      authorFullName: matchWithParen[1].trim(),
      authorUsername: matchWithParen[2].trim()
    };
  }

  const matchDirectHandle = altText.match(/(?:Photo|Video)\s+by\s+@([a-zA-Z0-9_.]+)/i);
  if (matchDirectHandle) {
    return {
      authorFullName: null,
      authorUsername: matchDirectHandle[1].trim()
    };
  }

  const matchNameOnly = altText.match(/(?:Photo|Video)\s+by\s+([^on]+)\s+on\s+/i);
  if (matchNameOnly) {
    return {
      authorFullName: matchNameOnly[1].trim(),
      authorUsername: matchNameOnly[1].trim().toLowerCase().replace(/\s+/g, '_')
    };
  }

  return { authorUsername: null, authorFullName: null };
}

// In-memory metadata cache to prevent duplicate network calls across collections
const metadataCache = new Map();

// Extract rich metadata per item via Instagram's public embed endpoint
async function fetchItemMetadata(shortcode) {
  if (!shortcode) return null;
  if (metadataCache.has(shortcode)) {
    return metadataCache.get(shortcode);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2200);

  try {
    const response = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) return null;

    const html = await response.text();

    let authorUsername = null;
    let authorFullName = null;
    let createdAt = null;
    let caption = null;

    const usernameMatch = html.match(/class="(?:EmbeddedMediaUser-username|UsernameText|username)">([^<]+)</i) 
      || html.match(/class="EmbeddedMediaUser"[^>]*href="https:\/\/www\.instagram\.com\/([^\/\?"]+)/i)
      || html.match(/class="CaptionUsername"[^>]*>([^<]+)</i);

    if (usernameMatch) {
      authorUsername = usernameMatch[1].trim();
    }

    const nameMatch = html.match(/class="EmbeddedMediaUser-displayName">([^<]+)</i);
    if (nameMatch) {
      authorFullName = nameMatch[1].trim();
    }

    const timeMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
    if (timeMatch) {
      createdAt = timeMatch[1];
    }

    const captionMatch = html.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
    if (captionMatch) {
      const rawText = sanitizeText(captionMatch[1].replace(/<[^>]+>/g, '').replace(/&#64;/g, '@').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
      let cleaned = rawText;
      if (authorUsername && cleaned.toLowerCase().startsWith(authorUsername.toLowerCase())) {
        cleaned = cleaned.slice(authorUsername.length).trim();
      }
      cleaned = cleaned.replace(/View all \d+ comments/gi, '').replace(/View all comments/gi, '').replace(/[\d,]+\s+likes?/gi, '').trim();
      caption = cleaned;
    }

    const result = {
      authorUsername,
      authorFullName,
      createdAt,
      caption
    };

    metadataCache.set(shortcode, result);
    return result;
  } catch (e) {
    clearTimeout(timeoutId);
    return null;
  }
}

// Concurrent batch metadata processor
async function syncItemDetails(items, concurrency = 5) {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.all(batch.map(async (item) => {
      const metadata = await fetchItemMetadata(item.shortcode);
      if (metadata) {
        if (metadata.authorUsername) item.authorUsername = metadata.authorUsername;
        if (metadata.authorFullName) item.authorFullName = metadata.authorFullName;
        if (metadata.createdAt) item.createdAt = metadata.createdAt;
        if (metadata.caption && (!item.caption || item.caption.length < metadata.caption.length)) {
          item.caption = metadata.caption;
        }
      }
    }));
  }
}

async function autoScrollFolder(folderName) {
  const collectionMap = new Map();
  let stagnantRounds = 0;
  let previousHeight = 0;

  while (stagnantRounds < 4) {
    const links = document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]');

    for (const link of links) {
      const rawHref = link.getAttribute('href');
      if (!rawHref) continue;

      const cleanHref = rawHref.split('?')[0].split('#')[0];
      const pathParts = cleanHref.split('/').filter(Boolean);
      const isReelOrPost = pathParts.includes('p') || pathParts.includes('reel');
      if (!isReelOrPost) continue;

      const codeIndex = pathParts.indexOf('reel') !== -1 ? pathParts.indexOf('reel') + 1 : pathParts.indexOf('p') + 1;
      const shortcode = pathParts[codeIndex];
      if (!shortcode) continue;

      const canonicalUrl = `https://www.instagram.com/p/${shortcode}/`;

      if (!collectionMap.has(canonicalUrl)) {
        const img = link.querySelector('img');
        const rawCaption = img ? (img.alt || "") : "";
        const cleanCaption = sanitizeText(rawCaption);
        const parsedAuthor = parseAuthorFromAlt(rawCaption);

        collectionMap.set(canonicalUrl, {
          shortcode: shortcode,
          url: canonicalUrl,
          folder: folderName,
          authorUsername: parsedAuthor.authorUsername,
          authorFullName: parsedAuthor.authorFullName,
          createdAt: null,
          thumbnail: img ? img.src : null,
          caption: cleanCaption,
          scrapedAt: new Date().toISOString()
        });
      }
    }

    notify(`<span class="status-action">scanning folder</span> <span class="status-folder">${folderName.toLowerCase()}</span> (<span class="status-count">${collectionMap.size}</span> <span class="status-action">posts found</span>)`, `${collectionMap.size}`);

    window.scrollBy(0, 1000);
    await wait(1100);

    const currentHeight = document.documentElement.scrollHeight;
    if (currentHeight === previousHeight) {
      stagnantRounds++;
    } else {
      stagnantRounds = 0;
      previousHeight = currentHeight;
    }
  }

  const items = Array.from(collectionMap.values());
  const pending = items.filter(item => item.shortcode && (!item.authorUsername || !item.createdAt));

  if (pending.length > 0) {
    notify(`<span class="status-action">fetching details for</span> <span class="status-count">${pending.length} posts</span> <span class="status-action">in folder</span> <span class="status-folder">${folderName.toLowerCase()}</span>`, "META");
    await syncItemDetails(pending, 5);
  }

  return items;
}

async function runAutonomousFlow() {
  notify("detecting account", "FIND");

  const authUser = await detectLoggedInUser();
  let username = authUser.username;
  let userId = authUser.userId;

  if (!username) {
    notify("Please log in to Instagram first.", "AUTH");
    safeSendMessage({
      type: "AUTH_REQUIRED",
      message: "Please log in to Instagram first."
    });
    return { success: false, reason: "NOT_LOGGED_IN" };
  }

  const savedHubUrl = `https://www.instagram.com/${username}/saved/`;

  if (!window.location.pathname.includes('/saved/')) {
    notify("opening saved posts", "NAV");
    window.history.pushState({}, "", savedHubUrl);
    window.dispatchEvent(new Event('popstate'));
    await wait(3000);
  }

  notify("locating collections", "SCAN");
  await wait(2000);

  const folderElements = document.querySelectorAll('a[href*="/saved/"]');
  const folderTargets = [];

  folderElements.forEach(el => {
    const href = el.getAttribute('href');
    if (href && href.includes('/saved/') && !href.endsWith('/saved/')) {
      const cleanUrl = "https://www.instagram.com" + href.split('?')[0];
      const visibleTitle = el.innerText ? sanitizeText(el.innerText.split('\n')[0]) : null;
      const pathParts = new URL(cleanUrl).pathname.split('/').filter(Boolean);
      const fallbackTitle = decodeURIComponent(pathParts[pathParts.length - 1] || "all posts");

      folderTargets.push({
        url: cleanUrl,
        name: visibleTitle || fallbackTitle
      });
    }
  });

  const uniqueFolders = Array.from(new Map(folderTargets.map(f => [f.url, f])).values());

  if (uniqueFolders.length === 0) {
    uniqueFolders.push({ url: window.location.href, name: "All Posts" });
  }

  const allSavedData = [];

  for (let i = 0; i < uniqueFolders.length; i++) {
    const folder = uniqueFolders[i];

    notify(`<span class="status-action">scanning folder</span> <span class="status-folder">${folder.name.toLowerCase()}</span> (<span class="status-count">${i + 1} of ${uniqueFolders.length}</span>)`, `${i + 1}/${uniqueFolders.length}`);

    window.history.pushState({}, "", folder.url);
    window.dispatchEvent(new Event('popstate'));
    await wait(2500);

    const reels = await autoScrollFolder(folder.name);
    const folderRecord = {
      folderName: folder.name,
      folderUrl: folder.url,
      items: reels
    };
    allSavedData.push(folderRecord);

    // Stream this folder's newly discovered posts live to dashboard immediately
    safeSendMessage({
      type: "STREAM_FOLDER_UPDATE",
      folderData: folderRecord
    });

    await wait(1000);
  }

  const totalCount = allSavedData.reduce((acc, f) => acc + f.items.length, 0);

  // Set of handles that actually authored saved reels
  const savedReelAuthors = new Set();
  for (const folder of allSavedData) {
    for (const item of (folder.items || [])) {
      if (item.authorUsername) {
        savedReelAuthors.add(item.authorUsername.toLowerCase().replace(/^@/, '').trim());
      }
    }
  }

  let followingCreators = [];
  try {
    notify("indexing following creators", "CREATORS");
    followingCreators = await crawlFollowingList(username, userId);

    if (followingCreators.length > 0) {
      // Stream initial following list to dashboard immediately
      safeSendMessage({
        type: "STREAM_CREATORS_UPDATE",
        creators: followingCreators
      });

      // Targeted Profile Info Sync: Only for creators with saved reels, with instant circuit breaker on rate limits
      await syncCreatorProfileDetails(followingCreators, savedReelAuthors);

      // Stream updated creators with bios to dashboard
      safeSendMessage({
        type: "STREAM_CREATORS_UPDATE",
        creators: followingCreators
      });
    }
  } catch (err) {
    console.warn("Following crawl skipped or errored:", err);
  }

  safeSendMessage({
    type: "EXPORT_DATA",
    total: totalCount,
    data: allSavedData,
    followingCreators: followingCreators
  });

  notify(`<span class="status-action">complete:</span> <span class="status-count">${totalCount} saved posts</span> <span class="status-action">and</span> <span class="status-creator">${followingCreators.length} creators</span> <span class="status-action">categorized</span>`, "OK");

  // Allow user to see the success banner for 2 seconds before automatically closing the background window
  await wait(2200);
  safeSendMessage({ type: "CLOSE_WORKER_WINDOW" });

  return {
    success: true,
    totalFolders: allSavedData.length,
    totalReels: totalCount,
    totalFollowing: followingCreators.length,
    data: allSavedData
  };
}

// In-memory creator profile cache to prevent redundant fetches
const creatorProfileCache = new Map();

// Extracts creator profile details (Bio, Category, Avatar) via web_profile_info with fallback
async function fetchCreatorProfile(username) {
  if (!username) return null;
  const cleanUser = username.toLowerCase().trim();
  if (creatorProfileCache.has(cleanUser)) {
    return creatorProfileCache.get(cleanUser);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    // Strategy 1: Instagram's internal Web Profile Info endpoint
    const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanUser}`, {
      signal: controller.signal,
      headers: getBaseHeaders()
    });
    clearTimeout(timeoutId);

    // If Strategy 1 hits a 429 rate limit, continue down to Strategy 2 (HTML page metadata)
    if (response.status !== 429 && response.ok) {
      const data = await response.json();
      const user = data?.data?.user;
      if (user) {
        const profile = {
          authorUsername: user.username,
          authorFullName: user.full_name || null,
          category: user.category_name || null,
          bio: user.biography ? sanitizeText(user.biography) : null,
          profilePic: user.profile_pic_url_hd || user.profile_pic_url || null,
          externalUrl: user.external_url || null,
          isVerified: user.is_verified || false
        };
        creatorProfileCache.set(cleanUser, profile);
        return profile;
      }
    }
  } catch (e) {
    clearTimeout(timeoutId);
  }

  // Strategy 2: Profile Page Open Graph / Meta Description Fallback
  try {
    const fallbackResponse = await fetch(`https://www.instagram.com/${cleanUser}/`, {
      headers: { 'Accept': 'text/html' }
    });
    if (fallbackResponse.ok) {
      const html = await fallbackResponse.text();
      let bio = null;

      const metaMatch = html.match(/<meta\s+(?:name="description"|property="og:description")\s+content="([^"]*)"/i);
      if (metaMatch) {
        const content = metaMatch[1];
        const bioPart = content.split(/:\s*["“]/)[1];
        if (bioPart) {
          bio = sanitizeText(bioPart.replace(/["”]$/, ''));
        }
      }

      const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
      if (schemaMatch) {
        try {
          const schema = JSON.parse(schemaMatch[1]);
          if (schema.description && !bio) bio = sanitizeText(schema.description);
        } catch (err) {}
      }

      const profile = {
        authorUsername: cleanUser,
        authorFullName: null,
        category: null,
        bio: bio,
        profilePic: null
      };
      creatorProfileCache.set(cleanUser, profile);
      return profile;
    }
  } catch (err) {}

  return null;
}

// Rate-safe sequential profile info fetcher with adaptive stealth pacing and rate-limit circuit-breaker
async function syncCreatorProfileDetails(creators, savedReelAuthors = new Set()) {
  // Only target creators who authored saved reels and don't already have bio or category
  const pending = creators.filter(c => {
    const handle = (c.authorUsername || '').toLowerCase().replace(/^@/, '').trim();
    const hasSavedReels = savedReelAuthors.size === 0 || savedReelAuthors.has(handle);
    return hasSavedReels && !c.bio && !c.category;
  });

  if (pending.length === 0) return;

  const maxToEnrich = Math.min(pending.length, 25); // Cap to safe lightweight batch

  for (let i = 0; i < maxToEnrich; i++) {
    const creator = pending[i];

    notify(
      `<span class="status-action">gathering profile details</span> (<span class="status-count">${i + 1}</span> <span class="status-action">of</span> <span class="status-count">${maxToEnrich}</span>)`,
      `${i + 1}/${maxToEnrich}`
    );

    const profile = await fetchCreatorProfile(creator.authorUsername);
    if (profile === 'RATE_LIMIT') {
      console.warn("Instagram rate limit reached during bio enrichment; gracefully finalizing sync.");
      notify(`<span class="status-action">finalizing sync...</span>`, "OK");
      break; // Immediately exit the loop - do NOT sit in a 10s sleep cycle!
    }

    if (profile && typeof profile === 'object') {
      if (profile.bio) creator.bio = profile.bio;
      if (profile.category) creator.category = profile.category;
      if (profile.authorFullName && !creator.authorFullName) creator.authorFullName = profile.authorFullName;
      if (profile.profilePic) creator.profilePic = profile.profilePic;
    }

    // Stream incremental creator updates every 5 items to keep dashboard fresh
    if ((i + 1) % 5 === 0 || i === maxToEnrich - 1) {
      safeSendMessage({
        type: "STREAM_CREATORS_UPDATE",
        creators: creators
      });
    }

    // Stealth pacing: 500ms to 900ms randomized human-like delay
    const jitter = 500 + Math.floor(Math.random() * 400);
    await wait(jitter);
  }
}

async function crawlFollowingList(username, userId) {
  const creatorsMap = new Map();
  const baseHeaders = getBaseHeaders();

  let resolvedUserId = userId;
  let expectedTotal = 640;

  // 1. If we don't have numeric userId yet, get it via web_profile_info
  if (!resolvedUserId && username) {
    try {
      const userRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
        headers: baseHeaders
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        resolvedUserId = userData?.data?.user?.id;
        expectedTotal = userData?.data?.user?.edge_follow?.count || 640;
      }
    } catch (e) {
      console.warn("Could not fetch user ID via profile info:", e);
    }
  }

  // 2. Fetch following list via Authenticated Friendship API
  if (resolvedUserId) {
    try {
      let nextMaxId = null;
      let page = 0;

      do {
        page++;
        const url = nextMaxId 
          ? `https://www.instagram.com/api/v1/friendships/${resolvedUserId}/following/?count=200&max_id=${nextMaxId}`
          : `https://www.instagram.com/api/v1/friendships/${resolvedUserId}/following/?count=200`;

        const followRes = await fetch(url, { headers: baseHeaders });
        if (!followRes.ok) break;

        const followData = await followRes.json();
        const users = followData.users || [];

        for (const u of users) {
          if (u.username && !creatorsMap.has(u.username)) {
            creatorsMap.set(u.username, {
              authorUsername: u.username,
              authorFullName: u.full_name || null,
              category: u.category || null,
              profilePic: u.profile_pic_url || null,
              isVerified: u.is_verified || false,
              isFollowing: true
            });
          }
        }

        notify(`<span class="status-action">indexing following</span> (<span class="status-count">${creatorsMap.size}</span> <span class="status-action">of</span> <span class="status-count">${expectedTotal}</span> <span class="status-creator">creators</span>)`, `${creatorsMap.size}`);

        nextMaxId = followData.next_max_id || null;
        await wait(300);
      } while (nextMaxId && page < 25);

      if (creatorsMap.size > 0) {
        return Array.from(creatorsMap.values());
      }
    } catch (e) {
      console.warn("Friendship API error:", e);
    }
  }

  // 3. Fallback: GraphQL Query for Following
  if (resolvedUserId && creatorsMap.size === 0) {
    try {
      let endCursor = null;
      let hasNextPage = true;
      let gqlPage = 0;

      while (hasNextPage && gqlPage < 30) {
        gqlPage++;
        const variables = JSON.stringify({
          id: resolvedUserId,
          include_reel: false,
          fetch_mutual: false,
          first: 50,
          after: endCursor
        });
        const gqlUrl = `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b52237c059d07ca1292a7&variables=${encodeURIComponent(variables)}`;
        const gqlRes = await fetch(gqlUrl, { headers: baseHeaders });
        if (!gqlRes.ok) break;

        const gqlData = await gqlRes.json();
        const edgeFollow = gqlData?.data?.user?.edge_follow;
        if (!edgeFollow) break;

        const edges = edgeFollow.edges || [];
        for (const edge of edges) {
          const node = edge.node;
          if (node && node.username && !creatorsMap.has(node.username)) {
            creatorsMap.set(node.username, {
              authorUsername: node.username,
              authorFullName: node.full_name || null,
              category: null,
              profilePic: node.profile_pic_url || null,
              isVerified: node.is_verified || false,
              isFollowing: true
            });
          }
        }

        notify(`<span class="status-action">indexing following</span> (<span class="status-count">${creatorsMap.size}</span> <span class="status-action">of</span> <span class="status-count">${expectedTotal}</span> <span class="status-creator">creators</span>)`, `${creatorsMap.size}`);
        hasNextPage = edgeFollow.page_info?.has_next_page;
        endCursor = edgeFollow.page_info?.end_cursor;
        await wait(300);
      }

      if (creatorsMap.size > 0) {
        return Array.from(creatorsMap.values());
      }
    } catch (e) {
      console.warn("GraphQL following error:", e);
    }
  }

  // 4. Fallback: Full Page Navigation & DOM Modal Crawl
  if (username && creatorsMap.size === 0) {
    if (!window.location.pathname.includes('/following')) {
      window.location.href = `https://www.instagram.com/${username}/following/`;
      await wait(4000);
    }

    let stagnantRounds = 0;
    let prevCount = 0;

    while (stagnantRounds < 8) {
      const modalDialog = document.querySelector('div[role="dialog"]');
      const scrollContainer = modalDialog 
        ? (modalDialog.querySelector('div[style*="overflow"]') || modalDialog.querySelector('div._aano') || modalDialog)
        : null;

      const userLinks = modalDialog 
        ? modalDialog.querySelectorAll('a[role="link"][href^="/"]')
        : document.querySelectorAll('a[role="link"][href^="/"]');

      for (const link of userLinks) {
        const href = link.getAttribute('href');
        if (href && !['/', '/explore/', '/reels/', '/direct/inbox/', '/your_activity/'].includes(href)) {
          const handle = href.replace(/\//g, '').split('?')[0];
          if (handle && handle.length > 0 && !creatorsMap.has(handle) && handle.toLowerCase() !== username.toLowerCase()) {
            const nameSpan = link.querySelector('span') || link.closest('div')?.querySelector('span');
            creatorsMap.set(handle, {
              authorUsername: handle,
              authorFullName: nameSpan ? sanitizeText(nameSpan.innerText) : null,
              isFollowing: true
            });
          }
        }
      }

      notify(`<span class="status-action">indexing following</span> (<span class="status-count">${creatorsMap.size}</span> <span class="status-creator">accounts found</span>)`, `${creatorsMap.size}`);

      if (creatorsMap.size === prevCount) {
        stagnantRounds++;
      } else {
        stagnantRounds = 0;
        prevCount = creatorsMap.size;
      }

      if (scrollContainer) {
        scrollContainer.scrollBy(0, 1500);
      } else {
        window.scrollBy(0, 1500);
      }
      await wait(800);
    }
  }

  return Array.from(creatorsMap.values());
}
