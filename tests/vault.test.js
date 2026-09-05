import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log("🧪 Running Reel Vault Comprehensive Test Suite...\n");

function cleanQuery(query) {
  if (!query) return "";
  let q = query.toLowerCase().trim();
  if (q.startsWith('@')) q = q.slice(1);
  return q;
}

// 1. Data Normalization and Deduplication
function normalizeRawCollections(rawCollections) {
  if (!Array.isArray(rawCollections)) return [];
  const flatMap = new Map();

  for (const col of rawCollections) {
    const folderName = col.folderName || "All Posts";
    const items = col.items || [];
    for (const item of items) {
      const key = item.url || item.shortcode || Math.random().toString();
      if (!flatMap.has(key)) {
        flatMap.set(key, {
          id: item.shortcode || item.url,
          shortcode: item.shortcode || null,
          url: item.url,
          folder: folderName,
          authorUsername: item.authorUsername || null,
          authorFullName: item.authorFullName || null,
          createdAt: item.createdAt || null,
          thumbnail: item.thumbnail || null,
          caption: (item.caption || "").replace(/[\u2028\u2029]/g, "\n").trim(),
          scrapedAt: item.scrapedAt || new Date().toISOString()
        });
      }
    }
  }
  return Array.from(flatMap.values());
}

// 2. Search & Filter Engine
function searchVault(items, query, selectedFolder = "ALL", sortBy = "newest") {
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

  if (sortBy === 'newest') {
    list.sort((a, b) => new Date(b.scrapedAt || 0) - new Date(a.scrapedAt || 0));
  } else if (sortBy === 'creator') {
    list.sort((a, b) => (a.authorUsername || "").localeCompare(b.authorUsername || ""));
  }

  return list;
}

// Test Dataset
const samplePayload = [
  {
    folderName: "AI & Tech",
    items: [
      {
        shortcode: "C12345",
        url: "https://www.instagram.com/reel/C12345/",
        authorUsername: "techguru",
        authorFullName: "Tech Guru",
        caption: "Top 5 AI tools in 2026",
        thumbnail: "https://example.com/thumb1.jpg",
        createdAt: "2026-08-01T12:00:00.000Z",
        scrapedAt: "2026-09-01T10:00:00.000Z"
      },
      {
        shortcode: "C67890",
        url: "https://www.instagram.com/reel/C67890/",
        authorUsername: "codemaster",
        authorFullName: "Code Master",
        caption: "Next.js vs Vite performance breakdown",
        thumbnail: "https://example.com/thumb2.jpg",
        createdAt: "2026-08-02T14:00:00.000Z",
        scrapedAt: "2026-09-02T10:00:00.000Z"
      }
    ]
  },
  {
    folderName: "Design",
    items: [
      {
        shortcode: "C12345", // Duplicate
        url: "https://www.instagram.com/reel/C12345/",
        authorUsername: "techguru",
        caption: "Top 5 AI tools in 2026"
      },
      {
        shortcode: "D11111",
        url: "https://www.instagram.com/reel/D11111/",
        authorUsername: "uidesigner",
        caption: "Glassmorphism design tutorial",
        thumbnail: "https://example.com/thumb3.jpg",
        createdAt: "2026-08-03T18:00:00.000Z",
        scrapedAt: "2026-09-03T10:00:00.000Z"
      }
    ]
  }
];

// Test 1: Deduplication & Normalization
const normalized = normalizeRawCollections(samplePayload);
assert.strictEqual(normalized.length, 3, "Should deduplicate reel C12345 across folders");
assert.strictEqual(normalized[0].authorUsername, "techguru");
console.log("✅ Test 1 Passed: Data normalization & deduplication is verified.");

// Test 2: Search with @ prefix
const creatorResults = searchVault(normalized, "@codemaster");
assert.strictEqual(creatorResults.length, 1, "@codemaster search should match authorUsername");
assert.strictEqual(creatorResults[0].shortcode, "C67890");
console.log("✅ Test 2 Passed: @handle query sanitization is verified.");

// Test 3: Folder Filtering
const designResults = searchVault(normalized, "", "Design");
assert.strictEqual(designResults.length, 1, "Design folder contains 1 unique item");
assert.strictEqual(designResults[0].shortcode, "D11111");
console.log("✅ Test 3 Passed: Folder filtering is verified.");

// Test 4: Manifest Validation
const manifestPath = path.join(process.cwd(), 'manifest.json');
const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifestContent.manifest_version, 3, "Manifest must be V3");
assert(manifestContent.permissions.includes("storage"), "Must include storage permission");
assert(manifestContent.permissions.includes("scripting"), "Must include scripting permission");
assert(manifestContent.permissions.includes("tabs"), "Must include tabs permission");
console.log("✅ Test 4 Passed: Manifest permissions & V3 compliance verified.");

console.log("\n🎉 All 4 Automated Tests Passed Successfully!");
