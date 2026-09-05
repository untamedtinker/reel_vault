import assert from 'node:assert';

console.log("🧪 Testing Multi-Folder Association & Comprehensive Search...\n");

// Simulated raw collections from Instagram export (Reel appears in "All posts" AND "Job search")
const rawScrapePayload = [
  {
    folderName: "All posts",
    items: [
      {
        shortcode: "DXy60ZwADX7",
        url: "https://www.instagram.com/p/DXy60ZwADX7/",
        caption: "Weeks of applying. Done in minutes.",
        authorUsername: "aiapply.co"
      }
    ]
  },
  {
    folderName: "Job search",
    items: [
      {
        shortcode: "DXy60ZwADX7",
        url: "https://www.instagram.com/p/DXy60ZwADX7/",
        caption: "Weeks of applying. Done in minutes.",
        authorUsername: "aiapply.co"
      }
    ]
  }
];

// Multi-folder association normalizer
function normalizeMultiFolderCollections(rawCollections) {
  const map = new Map();

  for (const col of rawCollections) {
    const fName = col.folderName || "All Posts";
    for (const item of (col.items || [])) {
      const key = item.shortcode || item.url;
      if (!map.has(key)) {
        map.set(key, {
          ...item,
          folders: [fName],
          folder: fName !== "All posts" && fName !== "All Posts" ? fName : (item.folder || fName)
        });
      } else {
        const existing = map.get(key);
        if (!existing.folders.includes(fName)) {
          existing.folders.push(fName);
        }
        // If existing folder was generic "All posts", promote specific folder name
        if ((existing.folder === "All posts" || existing.folder === "All Posts") && fName !== "All posts" && fName !== "All Posts") {
          existing.folder = fName;
        }
      }
    }
  }

  return Array.from(map.values());
}

const normalized = normalizeMultiFolderCollections(rawScrapePayload);

assert.strictEqual(normalized.length, 1);
assert.deepStrictEqual(normalized[0].folders, ["All posts", "Job search"]);
assert.strictEqual(normalized[0].folder, "Job search");
console.log("✅ Test 1 Passed: Multi-folder association preserves specific collection names.");

// Test 2: Search for "Job search"
function searchVaultComprehensive(items, query) {
  const rawQ = (query || "").trim().toLowerCase();
  const tokens = rawQ.split(/\s+/).map(t => {
    if (t.startsWith('@') || t.startsWith('#')) return t.slice(1);
    return t;
  }).filter(Boolean);

  if (tokens.length === 0) return items;

  return items.filter(item => {
    const caption = (item.caption || "").toLowerCase();
    const author = (item.authorUsername || "").toLowerCase();
    const fullName = (item.authorFullName || "").toLowerCase();
    const foldersStr = (item.folders || [item.folder || ""]).join(' ').toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    const shortcode = (item.shortcode || "").toLowerCase();

    const blob = `${author} ${fullName} ${foldersStr} ${tags} ${shortcode} ${caption}`;
    return tokens.every(token => blob.includes(token));
  });
}

const searchResults = searchVaultComprehensive(normalized, "Job search");
assert.strictEqual(searchResults.length, 1, "Searching for folder name 'Job search' must find the reel");
console.log("✅ Test 2 Passed: Searching for folder name 'Job search' successfully returns matching reel.");

console.log("\n🎉 Multi-folder & comprehensive search tests passed!");
