import fs from 'node:fs';

const html = fs.readFileSync('tests/sample_embed.html', 'utf8');

// Look for window.__additionalDataLoaded or gql data or script JSON
const jsonMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
console.log(`Found ${jsonMatches ? jsonMatches.length : 0} script tags`);

// Search for username patterns
const usernames = html.match(/instagram\.com\/([a-zA-Z0-9_.]+)\/?/gi);
console.log("Instagram URL matches:", Array.from(new Set(usernames)).slice(0, 10));

// Search for strings containing author/owner/username/caption
const matchContext = [];
const lines = html.split('\n');
for (const line of lines) {
  if (line.includes('username') || line.includes('author') || line.includes('Caption') || line.includes('shortcode') || line.includes('taken_at')) {
    matchContext.push(line.trim().slice(0, 120));
  }
}

console.log("\nMatches in HTML (sample):");
console.log(matchContext.slice(0, 15));
