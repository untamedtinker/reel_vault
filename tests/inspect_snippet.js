import fs from 'node:fs';

const html = fs.readFileSync('tests/sample_embed.html', 'utf8');
const jsonScripts = Array.from(html.matchAll(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi));
const raw = jsonScripts[11][1];

// Find occurrences of username, full_name, profile, etc.
const idx = raw.indexOf("just so we all have all the information");
if (idx !== -1) {
  console.log("Snippet around caption:");
  console.log(raw.slice(Math.max(0, idx - 400), Math.min(raw.length, idx + 400)));
}
