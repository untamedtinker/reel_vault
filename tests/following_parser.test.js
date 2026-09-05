import assert from 'node:assert';

console.log("🧪 Testing Following List Parser & Extraction...\n");

function parseFollowingLinks(rawLinks) {
  const map = new Map();
  for (const item of rawLinks) {
    const href = item.href || "";
    if (href && !['/', '/explore/', '/reels/', '/direct/inbox/', '/your_activity/'].includes(href)) {
      const handle = href.replace(/\//g, '').split('?')[0];
      if (handle && handle.length > 0 && !map.has(handle)) {
        map.set(handle, {
          authorUsername: handle,
          authorFullName: item.text || null
        });
      }
    }
  }
  return Array.from(map.values());
}

const sampleDOM = [
  { href: "/dr_spine_mobility/", text: "Dr. Alex Mobility DPT" },
  { href: "/pilateswithsarah/", text: "Sarah Miller Pilates" },
  { href: "/explore/", text: "Explore" },
  { href: "/vvanedwards/", text: "Vanessa Van Edwards" }
];

const parsed = parseFollowingLinks(sampleDOM);
assert.strictEqual(parsed.length, 3);
assert.strictEqual(parsed[0].authorUsername, "dr_spine_mobility");
assert.strictEqual(parsed[1].authorUsername, "pilateswithsarah");
assert.strictEqual(parsed[2].authorUsername, "vvanedwards");

console.log("✅ Following accounts cleanly parsed without systemic navigation links.");
console.log("\n🎉 Following Parser Test Passed!");
