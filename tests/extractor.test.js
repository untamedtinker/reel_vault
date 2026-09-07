import assert from 'node:assert';

console.log("🧪 Testing Creator and Tag Extraction Strategies...\n");

// Strategy 1: Caption Hashtag and Mention Extractor
function extractTagsAndMentions(caption) {
  if (!caption) return { tags: [], mentions: [] };
  const tags = Array.from(caption.matchAll(/#([a-zA-Z0-9_\u0080-\uFFFF]+)/g)).map(m => `#${m[1]}`);
  const mentions = Array.from(caption.matchAll(/@([a-zA-Z0-9_.]+)/g)).map(m => m[1]);
  return { tags, mentions };
}

// Strategy 2: Image Alt Text Creator Parser
function parseAltText(altText) {
  if (!altText) return { authorUsername: null, authorFullName: null };
  
  // Format: "Photo by John Doe (@johndoe) on ..." or "Video by @johndoe on ..."
  const matchWithParen = altText.match(/(?:Photo|Video)\s+by\s+([^(@]+)\s*\(@([a-zA-Z0-9_.]+)\)/i);
  if (matchWithParen) {
    return {
      authorFullName: matchWithParen[1].trim(),
      authorUsername: matchWithParen[2].trim()
    };
  }

  // Format: "Photo by @johndoe on ..."
  const matchDirectHandle = altText.match(/(?:Photo|Video)\s+by\s+@([a-zA-Z0-9_.]+)/i);
  if (matchDirectHandle) {
    return {
      authorFullName: null,
      authorUsername: matchDirectHandle[1].trim()
    };
  }

  // Format: "Photo by John Doe on ..."
  const matchNameOnly = altText.match(/(?:Photo|Video)\s+by\s+([^on]+)\s+on\s+/i);
  if (matchNameOnly) {
    return {
      authorFullName: matchNameOnly[1].trim(),
      authorUsername: matchNameOnly[1].trim().toLowerCase().replace(/\s+/g, '_')
    };
  }

  return { authorUsername: null, authorFullName: null };
}

// Test 1: Extract from Alt text
const altSample1 = "Video by Tech Insider (@techinsider) on August 15, 2026. May be an image of screen.";
const res1 = parseAltText(altSample1);
assert.strictEqual(res1.authorUsername, "techinsider");
assert.strictEqual(res1.authorFullName, "Tech Insider");
console.log("✅ Strategy 1 Passed: Alt text with name and (@handle) parsed.");

const altSample2 = "Photo by @codinghub on July 10, 2026.";
const res2 = parseAltText(altSample2);
assert.strictEqual(res2.authorUsername, "codinghub");
console.log("✅ Strategy 2 Passed: Alt text with @handle parsed.");

// Test 2: Hashtag and Mention Extractor
const captionSample = "Building an AI agent with #nextjs and #react! Shoutout to @sama and @openai #ai";
const resTags = extractTagsAndMentions(captionSample);
assert.deepStrictEqual(resTags.tags, ["#nextjs", "#react", "#ai"]);
assert.deepStrictEqual(resTags.mentions, ["sama", "openai"]);
console.log("✅ Strategy 3 Passed: Hashtag and Mention extraction from captions parsed.");

console.log("\n🎉 All Extraction Tests Passed!");
