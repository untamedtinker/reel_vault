import fs from 'node:fs';

const html = fs.readFileSync('tests/sample_embed.html', 'utf8');
const code = "Db4DLZIh5a3";
const idx = html.indexOf(code);
console.log(`Found shortcode at index: ${idx}`);
if (idx !== -1) {
  console.log(html.slice(Math.max(0, idx - 400), Math.min(html.length, idx + 800)));
}
