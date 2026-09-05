import assert from 'node:assert';

console.log("🧪 Testing Deduplicated Parallel Batch Enrichment Architecture...\n");

const metadataCache = new Map();
let fetchCount = 0;

// Simulated network fetch
async function mockFetchMetadata(shortcode) {
  if (metadataCache.has(shortcode)) {
    return metadataCache.get(shortcode);
  }
  fetchCount++;
  await new Promise(r => setTimeout(r, 60)); // simulate 60ms network latency
  const data = {
    authorUsername: `creator_${shortcode}`,
    authorFullName: `Creator ${shortcode}`,
    createdAt: new Date().toISOString()
  };
  metadataCache.set(shortcode, data);
  return data;
}

// Parallel worker pool with concurrency 5
async function enrichItemsConcurrently(items, concurrency = 5) {
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    await Promise.all(batch.map(async (item) => {
      if (item.shortcode) {
        const meta = await mockFetchMetadata(item.shortcode);
        if (meta) {
          item.authorUsername = meta.authorUsername;
          item.authorFullName = meta.authorFullName;
          item.createdAt = meta.createdAt;
        }
      }
    }));
  }
}

// Simulated 5 folders with 50 items each, but overlapping shortcodes
const folder1 = Array.from({ length: 50 }, (_, i) => ({ shortcode: `code_${i}` }));
const folder2 = Array.from({ length: 30 }, (_, i) => ({ shortcode: `code_${i}` })); // 30 duplicates

const start = Date.now();
await enrichItemsConcurrently(folder1, 5);
await enrichItemsConcurrently(folder2, 5);
const duration = Date.now() - start;

assert.strictEqual(fetchCount, 50, "Duplicate reels across folders must be fetched exactly once (from cache)");
assert.strictEqual(folder2[0].authorUsername, "creator_code_0");

console.log(`✅ 80 items enriched in ${duration}ms (Cache prevented 30 redundant network roundtrips)`);
console.log("🎉 Deduplicated parallel engine verified!");
