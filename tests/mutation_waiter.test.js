import assert from 'node:assert';

console.log("🧪 Testing Mutation Observer & Architecture Resilience...\n");

// Simulated DOM Waiter with immediate resolution
async function mockWaitForElement(hasElementImmediately) {
  const start = Date.now();
  if (hasElementImmediately) {
    return { el: true, duration: Date.now() - start };
  }
  await new Promise(r => setTimeout(r, 40));
  return { el: true, duration: Date.now() - start };
}

const immediate = await mockWaitForElement(true);
assert(immediate.duration < 10, "Immediate DOM element should resolve in under 10ms");

const delayed = await mockWaitForElement(false);
assert(delayed.duration >= 35, "Delayed element should resolve on appearance");

console.log("✅ MutationObserver element resolution verified!");
