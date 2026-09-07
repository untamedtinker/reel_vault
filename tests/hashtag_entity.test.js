import assert from 'node:assert';

console.log("🧪 Testing Hashtag Entity Decoding & Pure-Number Filtering...\n");

function decodeHtmlEntities(text) {
  if (!text) return "";
  return text
    .replace(/&#64;/g, "@")
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function extractTagsFromCaption(caption) {
  if (!caption) return [];
  const decoded = decodeHtmlEntities(caption);
  
  // Hashtags must start with #, not be pure digits (like #64 or #123), and have at least 1 letter
  const matches = decoded.match(/#([a-zA-Z\u0080-\uFFFF][a-zA-Z0-9_\u0080-\uFFFF]*)/g);
  if (!matches) return [];

  return Array.from(new Set(matches.map(t => t.toLowerCase()))).filter(t => !/^#\d+$/.test(t));
}

// Sample caption containing &#64; entity and real hashtag
const sample1 = "Tell me your craziest story &#64;masterclass thanks! #manifesting #mindset";
const tags1 = extractTagsFromCaption(sample1);

assert.deepStrictEqual(tags1, ["#manifesting", "#mindset"]);
assert(!tags1.includes("#64"), "Tag array must NOT contain #64 entity artifact");
console.log("✅ Test 1 Passed: &#64; entity is decoded to @ and #64 is completely eliminated.");

const sample2 = "Check out this reel &#64;steven #tech";
const tags2 = extractTagsFromCaption(sample2);
assert.deepStrictEqual(tags2, ["#tech"]);
console.log("✅ Test 2 Passed: #64 eliminated from sample 2.");

console.log("\n🎉 Entity & Hashtag Tests Passed!");
