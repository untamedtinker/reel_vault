import fs from 'node:fs';

const html = fs.readFileSync('tests/sample_embed.html', 'utf8');

// Parse all JSON script blocks
const jsonScripts = Array.from(html.matchAll(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi));
console.log(`Found ${jsonScripts.length} JSON scripts`);

for (let i = 0; i < jsonScripts.length; i++) {
  try {
    const raw = jsonScripts[i][1];
    if (raw.includes('shortcode') || raw.includes('owner') || raw.includes('username') || raw.includes('just so we all have all the information')) {
      console.log(`\nScript #${i} has relevant keywords! Size: ${raw.length}`);
      
      // Let's search inside this json string
      const matchOwner = raw.match(/"username":"([^"]+)"/g);
      if (matchOwner) console.log("Usernames found:", matchOwner);

      const matchFullName = raw.match(/"full_name":"([^"]+)"/g);
      if (matchFullName) console.log("Full names found:", matchFullName);

      const matchTakenAt = raw.match(/"taken_at":([0-9]+)/g);
      if (matchTakenAt) console.log("Taken at timestamps:", matchTakenAt);
    }
  } catch (e) {}
}
