import assert from 'node:assert';

console.log("🧪 Testing Advanced Multi-Token Global Search Engine...\n");

function searchVaultAdvanced(items, query, selectedFolder = "ALL", selectedTag = "ALL") {
  const rawQ = (query || "").trim().toLowerCase();
  const tokens = rawQ.split(/\s+/).map(t => {
    if (t.startsWith('@') || t.startsWith('#')) return t.slice(1);
    return t;
  }).filter(Boolean);

  let list = [...items];

  // If NO search query is entered, respect the UI folder & tag filter
  if (tokens.length === 0) {
    if (selectedFolder !== "ALL") {
      list = list.filter(item => item.folder === selectedFolder);
    }
    if (selectedTag !== "ALL") {
      list = list.filter(item => (item.tags || []).includes(selectedTag));
    }
    return list;
  }

  // When searching, perform GLOBAL multi-token matching across caption, author, folder, tags, and URL
  return list.filter(item => {
    const caption = (item.caption || "").toLowerCase();
    const author = (item.authorUsername || "").toLowerCase();
    const fullName = (item.authorFullName || "").toLowerCase();
    const folder = (item.folder || "").toLowerCase();
    const tags = (item.tags || []).join(' ').toLowerCase();
    const shortcode = (item.shortcode || "").toLowerCase();

    const searchableBlob = `${author} ${fullName} ${folder} ${tags} ${shortcode} ${caption}`;

    // Every token typed by user must match the item
    return tokens.every(token => searchableBlob.includes(token));
  });
}

const sampleData = [
  {
    shortcode: "DXy60ZwADX7",
    folder: "Job search",
    authorUsername: "aiapply.co",
    authorFullName: "AI Apply",
    caption: "Weeks of applying. Done in minutes.",
    tags: ["#jobs", "#career", "#ai"]
  },
  {
    shortcode: "DZkgG0IDHpH",
    folder: "Coding",
    authorUsername: "techinsider",
    authorFullName: "Tech Insider",
    caption: "Top 5 Python tips for 2026",
    tags: ["#python", "#coding"]
  }
];

// Test 1: Search by folder name
const res1 = searchVaultAdvanced(sampleData, "Job search");
assert.strictEqual(res1.length, 1);
assert.strictEqual(res1[0].shortcode, "DXy60ZwADX7");
console.log("✅ Test 1 Passed: Search by folder name matches correctly.");

// Test 2: Search with @ handle
const res2 = searchVaultAdvanced(sampleData, "@aiapply.co");
assert.strictEqual(res2.length, 1);
console.log("✅ Test 2 Passed: Search by @creator handle matches.");

// Test 3: Search with # hashtag
const res3 = searchVaultAdvanced(sampleData, "#career");
assert.strictEqual(res3.length, 1);
console.log("✅ Test 3 Passed: Search by #hashtag matches.");

// Test 4: Multi-word query ("ai minutes")
const res4 = searchVaultAdvanced(sampleData, "ai minutes");
assert.strictEqual(res4.length, 1);
console.log("✅ Test 4 Passed: Multi-word token search matches across fields.");

console.log("\n🎉 Advanced Search Tests Passed!");
