/* ==========================================================================
   LANDING PAGE CONTROLLER & SHOWCASE GENERATOR
   Scope: Standalone Marketing & Product Preview (pages/landing.html)
   Description: Manages ticker marquees, sample creator cards, and smooth navigation
   triggers to the primary Reel Vault extension dashboard.
   ========================================================================== */

/**
 * Universal taxonomy category mapping with corresponding CSS color variable tokens.
 */
const CATEGORIES = {
  tech: { label: "Tech, AI & Science", sub: "AI Systems & LLMs", color: "var(--c-tech)" },
  food: { label: "Food & Culinary", sub: "Cooking, Recipes & Dining", color: "var(--c-food)" },
  arts: { label: "Arts & Creative", sub: "Architecture & 3D Spatial", color: "var(--c-arts)" },
  fitness: { label: "Fitness, Movement & Rehab", sub: "Movement & Biomechanics", color: "var(--c-fitness)" },
  medicine: { label: "Medicine, Health & Wellness", sub: "Cognitive Neuroscience", color: "var(--c-medicine)" },
  business: { label: "Business & Finance", sub: "Venture & Startups", color: "var(--c-business)" },
  fashion: { label: "Fashion, Beauty & Style", sub: "Apparel & Styling", color: "var(--c-fashion)" },
  mindset: { label: "Mindset, Psychology & Learning", sub: "Habits & Psychology", color: "var(--c-mindset)" },
  travel: { label: "Travel, Outdoors & Adventure", sub: "Expeditions & Hiking", color: "var(--c-travel)" },
  entertainment: { label: "Entertainment, Music & Arts", sub: "Performance & Music", color: "var(--c-entertainment)" },
  general: { label: "General & Lifestyle", sub: "Everyday & Career", color: "var(--c-general)" }
};

// Curated fictional creator profile samples matching exact Creator Studio Pass UI
const PLACEHOLDER_FOLDERS = [
  {
    name: "Chef Kai Vance",
    handle: "@kaicookslocal",
    avatarBg: "linear-gradient(135deg, #6366f1, #a855f7)",
    cat: "food",
    categoryLabel: "Food & Culinary",
    subGroup: "Cooking & Dining",
    count: 6,
    isFollowing: true,
    size: "lg",
    reels: [
      { pattern: "p1", title: "Crispy Sesame Tofu" },
      { pattern: "p2", title: "Weekend Ramen Broth" },
      { pattern: "p3", title: "Pan-Seared Salmon" },
      { pattern: "p4", title: "Handmade Dumplings" }
    ]
  },
  {
    name: "Elena Rostova",
    handle: "@elena_builds",
    avatarBg: "linear-gradient(135deg, #a855f7, #ec4899)",
    cat: "tech",
    categoryLabel: "Tech & AI",
    subGroup: "AI Systems",
    count: 5,
    isFollowing: true,
    size: "lg",
    reels: [
      { pattern: "p2", title: "Autonomous Agents" },
      { pattern: "p1", title: "Local Neural Nets" },
      { pattern: "p4", title: "Offline Indexes" },
      { pattern: "p3", title: "Vector Search" }
    ]
  },
  {
    name: "Marcus Sterling",
    handle: "@sterling_movement",
    avatarBg: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
    cat: "fitness",
    categoryLabel: "Fitness & Movement",
    subGroup: "Biomechanics",
    count: 4,
    isFollowing: true,
    size: "md",
    reels: [
      { pattern: "p3", title: "Thoracic Mobility" },
      { pattern: "p4", title: "Gait Realignment" },
      { pattern: "p1", title: "Deep Hip Flexion" },
      { pattern: "p2", title: "Spine Mechanics" }
    ]
  }
];

const TILE_COUNT_MAP = { lg: 6, md: 4, sm: 2 };
const TILE_PATTERNS = ["p1", "p2", "p3", "p4"];

// Generates geometric placeholder tile grid for folder preview
function generateMosaicMarkup(size) {
  const count = TILE_COUNT_MAP[size] || 4;
  let tilesHtml = "";
  for (let i = 0; i < count; i++) {
    const patternClass = TILE_PATTERNS[i % TILE_PATTERNS.length];
    tilesHtml += `<div class="tile ${patternClass}"></div>`;
  }
  return `<div class="mosaic size-${size}">${tilesHtml}</div>`;
}

// Builds individual Creator Studio Pass Card markup matching exact dashboard cards
function generateCardMarkup(folder) {
  const categoryConfig = CATEGORIES[folder.cat] || { label: "General & Lifestyle", sub: "General", color: "var(--c-general)" };
  const initial = folder.name.replace(/^@/, "").charAt(0).toUpperCase();

  const reelThumbsHtml = (folder.reels || []).map((reel) => `
    <div class="creator-reel-thumb ${reel.pattern}" data-cat="${folder.cat}">
      <span class="reel-thumb-label">${reel.title}</span>
    </div>
  `).join("");

  return `
    <div class="creator-profile-card" data-name="${folder.name.toLowerCase()}" data-cat="${folder.cat}">
      <div>
        <div class="creator-card-header">
          <div class="creator-card-avatar" style="background: ${folder.avatarBg || 'linear-gradient(135deg, #6366f1, #a855f7)'};">
            ${initial}
          </div>
          <div class="creator-card-identity">
            <div class="creator-card-name-row">
              <span class="creator-card-name">${folder.name}</span>
              <span class="creator-follow-badge followed">FOLLOWING</span>
            </div>
            <span class="creator-card-handle">${folder.handle}</span>
          </div>
        </div>

        <div class="creator-card-tags">
          <span class="creator-tag-pill" style="--tag-color: ${categoryConfig.color};">
            <i class="cat-dot" style="background: ${categoryConfig.color};"></i>
            <span>${folder.categoryLabel || categoryConfig.label}</span>
          </span>
          <span class="creator-tag-pill subtle">${folder.subGroup || categoryConfig.sub}</span>
        </div>

        <div class="creator-content-ribbon">
          ${reelThumbsHtml}
        </div>
      </div>

      <div class="creator-card-footer">
        <span class="creator-reels-count">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
          ${folder.count} saved reels
        </span>
        <span class="creator-card-view-btn">
          <span>View</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </span>
      </div>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const foldersGrid = document.getElementById("foldersGrid");
  const filmTrack = document.getElementById("filmTrack");

  if (!foldersGrid) {
    return;
  }

  // Populate realistic creator cards
  foldersGrid.innerHTML = PLACEHOLDER_FOLDERS.map((folder) => generateCardMarkup(folder)).join("");

  // Populate filmstrip marquee for continuous marquee loop
  if (filmTrack) {
    const categoryEntries = Object.entries(CATEGORIES);
    const chipsMarkup = categoryEntries.map(([catKey, catObj]) => {
      return `<span class="film-chip" data-cat="${catKey}"><i style="background: ${catObj.color};"></i>${catObj.label}</span>`;
    }).join("");
    filmTrack.innerHTML = chipsMarkup + chipsMarkup;
  }

  // Interactive FAQ Accordion (Single-open accordion behavior)
  const faqButtons = document.querySelectorAll(".faq-question-btn");
  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".faq-card");
      const isOpen = card.classList.contains("open");

      // Close all FAQ items first
      document.querySelectorAll(".faq-card.open").forEach((openCard) => {
        openCard.classList.remove("open");
        const openBtn = openCard.querySelector(".faq-question-btn");
        if (openBtn) {
          openBtn.setAttribute("aria-expanded", "false");
        }
      });

      // If the clicked FAQ was not already open, open it
      if (!isOpen) {
        card.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Environment-aware CTAs:
  // Inside Chrome Extension or Local filesystem -> show "Open Vault"
  // On GitHub Pages web hosting -> show "Download (.zip)" and "View on GitHub"
  const isExtensionOrLocal = window.location.protocol.startsWith("chrome-extension") || 
                             window.location.protocol === "file:" ||
                             (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id);

  if (isExtensionOrLocal) {
    const heroActions = document.querySelector(".hero-actions");
    if (heroActions) {
      heroActions.innerHTML = `
        <a href="../index.html" class="hero-primary-btn" title="Open Vault Dashboard">
          <span>Open Vault</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
        <a href="https://github.com/untamedtinker/reel_vault" target="_blank" rel="noopener noreferrer" class="hero-secondary-btn" title="View Source on GitHub">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
          </svg>
          <span>View on GitHub</span>
        </a>
      `;
    }
  }
});
