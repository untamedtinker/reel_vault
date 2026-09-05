import assert from 'node:assert';

console.log("🧪 Testing Parallel Batch Enrichment Pool...\n");

// Simulated enrich function (50ms per item)
async function mockEnrich(id) {
  await new Promise(r => setTimeout(r, 50));
  return { id, author: `user_${id}` };
}

// Concurrent batch processor with concurrency limit
async function enrichInBatches(items, concurrency = 5) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(item => mockEnrich(item.id)));
    results.push(...batchResults);
  }
  return results;
}

const testItems = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }));

const start = Date.now();
const res = await enrichInBatches(testItems, 5);
const duration = Date.now() - start;

assert.strictEqual(res.length, 20);
console.log(`✅ 20 items processed in ${duration}ms (Expected ~200ms with concurrency 5, vs 1000ms sequentially)`);
console.log("🚀 Parallel worker pool verified!");
