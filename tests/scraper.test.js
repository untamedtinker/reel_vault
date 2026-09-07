import assert from 'node:assert';
import fs from 'node:fs';

console.log("🧪 Running Scraper Resilience & Parser Tests...\n");

// Helper: Query cleaner
function cleanQuery(query) {
  if (!query) return "";
  let q = query.toLowerCase().trim();
  if (q.startsWith('@')) q = q.slice(1);
  return q;
}

function searchVault(items, query, selectedFolder = "ALL") {
  let list = [...items];
  if (selectedFolder !== "ALL") {
    list = list.filter(i => i.folder === selectedFolder);
  }
  const q = cleanQuery(query);
  if (q.length > 0) {
    list = list.filter(item => {
      const caption = (item.caption || "").toLowerCase();
      const author = (item.authorUsername || "").toLowerCase();
      const fullName = (item.authorFullName || "").toLowerCase();
      const folder = (item.folder || "").toLowerCase();
      return caption.includes(q) || author.includes(q) || fullName.includes(q) || folder.includes(q);
    });
  }
  return list;
}

const testReels = [
  {
    id: "reel1",
    shortcode: "C111",
    url: "https://www.instagram.com/reel/C111/",
    folder: "Coding",
    authorUsername: "techguru",
    authorFullName: "Tech Guru",
    caption: "5 AI tools for developers in 2026"
  },
  {
    id: "reel2",
    shortcode: "C222",
    url: "https://www.instagram.com/reel/C222/",
    folder: "Design",
    authorUsername: "pixelmaster",
    authorFullName: "Pixel Master",
    caption: "Figma UI glassmorphism tricks"
  }
];

// Test: Query with @ prefix
const atQueryResult = searchVault(testReels, "@techguru");
assert.strictEqual(atQueryResult.length, 1, "@ prefix query should match authorUsername");
assert.strictEqual(atQueryResult[0].authorUsername, "techguru");
console.log("✅ Test 1 Passed: Search handle query (@username) sanitization works.");

// Test: Empty / Missing metadata resilience
function sanitizeReel(raw) {
  return {
    id: raw.shortcode || raw.url || String(Math.random()),
    shortcode: raw.shortcode || null,
    url: raw.url || "#",
    folder: raw.folder || "All Posts",
    authorUsername: raw.authorUsername || null,
    authorFullName: raw.authorFullName || null,
    createdAt: raw.createdAt || null,
    thumbnail: raw.thumbnail || null,
    caption: (raw.caption || "").replace(/[\u2028\u2029]/g, "\n").trim(),
    scrapedAt: raw.scrapedAt || new Date().toISOString()
  };
}

const brokenRaw = {
  url: "https://www.instagram.com/reel/C999/",
  caption: "Broken\u2028Line\u2029Test"
};
const cleaned = sanitizeReel(brokenRaw);
assert.strictEqual(cleaned.caption, "Broken\nLine\nTest");
assert.strictEqual(cleaned.folder, "All Posts");
console.log("✅ Test 2 Passed: Unicode line separator sanitization & fallback fields work.");

console.log("\n🎉 Scraper logic tests completed successfully!");
