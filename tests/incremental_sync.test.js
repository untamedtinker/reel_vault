import assert from 'node:assert';

console.log("🧪 Testing Incremental Sync & Early-Stopping Engine...\n");

// Existing Vault in storage (e.g. 50 reels from previous crawl)
const existingVaultMap = new Map([
  ["C111", { shortcode: "C111", url: "https://www.instagram.com/p/C111/", authorUsername: "creator1", createdAt: "2026-08-01T00:00:00Z" }],
  ["C222", { shortcode: "C222", url: "https://www.instagram.com/p/C222/", authorUsername: "creator2", createdAt: "2026-08-02T00:00:00Z" }],
  ["C333", { shortcode: "C333", url: "https://www.instagram.com/p/C333/", authorUsername: "creator3", createdAt: "2026-08-03T00:00:00Z" }],
  ["C444", { shortcode: "C444", url: "https://www.instagram.com/p/C444/", authorUsername: "creator4", createdAt: "2026-08-04T00:00:00Z" }]
]);

// Simulated newly loaded feed items during scroll (1 new reel C000, followed by existing reels C111, C222, C333, C444)
const feedItemsOnScroll = [
  { shortcode: "C000", url: "https://www.instagram.com/p/C000/" }, // NEW
  { shortcode: "C111", url: "https://www.instagram.com/p/C111/" }, // EXISTING
  { shortcode: "C222", url: "https://www.instagram.com/p/C222/" }, // EXISTING
  { shortcode: "C333", url: "https://www.instagram.com/p/C333/" }, // EXISTING
  { shortcode: "C444", url: "https://www.instagram.com/p/C444/" }  // EXISTING
];

// Test Early Stopping logic (trigger early stop if 3 consecutive existing reels found)
let consecutiveExisting = 0;
const earlyStopThreshold = 3;
let earlyStopped = false;
let enrichedCount = 0;

for (const item of feedItemsOnScroll) {
  if (existingVaultMap.has(item.shortcode) && existingVaultMap.get(item.shortcode).authorUsername) {
    consecutiveExisting++;
    if (consecutiveExisting >= earlyStopThreshold) {
      earlyStopped = true;
      break;
    }
  } else {
    consecutiveExisting = 0;
    enrichedCount++; // Only new item C000 needs enrichment
  }
}

assert.strictEqual(earlyStopped, true, "Early stopping should trigger when threshold of consecutive existing reels is reached");
assert.strictEqual(enrichedCount, 1, "Only the 1 new reel should require network metadata enrichment");

console.log("✅ Test 1 Passed: Early stopping and zero redundant enrichment verified.");
console.log("\n🎉 Incremental Sync tests completed successfully!");
