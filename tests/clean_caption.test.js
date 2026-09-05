import assert from 'node:assert';

console.log("🧪 Testing Clean Caption & Creator Separation...\n");

function cleanCaptionText(rawCaption, authorUsername) {
  if (!rawCaption) return "";
  let text = rawCaption;

  // 1. If caption begins with author username glued to first word (e.g. "vvanedwardsIs this real?!")
  if (authorUsername) {
    const cleanAuthor = authorUsername.replace(/^@/, '');
    // If exact prefix:
    if (text.toLowerCase().startsWith(cleanAuthor.toLowerCase())) {
      text = text.slice(cleanAuthor.length).trim();
    }
  }

  // 2. Strip "View all X comments" or "View comments"
  text = text.replace(/View all \d+ comments/gi, '');
  text = text.replace(/View all comments/gi, '');

  // 3. Strip trailing likes count
  text = text.replace(/[\d,]+\s+likes?/gi, '');

  return text.trim();
}

const raw1 = "vvanedwardsIs this real?! Tell me your craziest manifesting story below. Also, does anyone know any science on this?!? @masterclass thanks for making this happen! @steven thanks for hearing my call!View all 406 comments";
const cleaned1 = cleanCaptionText(raw1, "vvanedwards");

assert.strictEqual(
  cleaned1,
  "Is this real?! Tell me your craziest manifesting story below. Also, does anyone know any science on this?!? @masterclass thanks for making this happen! @steven thanks for hearing my call!"
);
console.log("✅ Test 1 Passed: Glued creator handle and trailing comment counters cleanly stripped.");

const raw2 = "aiapply.coWeeks of applying. Done in minutes. View all 12 comments 4,520 likes";
const cleaned2 = cleanCaptionText(raw2, "aiapply.co");
assert.strictEqual(cleaned2, "Weeks of applying. Done in minutes.");
console.log("✅ Test 2 Passed: Second case stripped perfectly.");

console.log("\n🎉 Clean Caption Tests Passed!");
