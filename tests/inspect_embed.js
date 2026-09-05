import fs from 'node:fs';

async function inspectHtml() {
  const shortcode = "Db4DLZIh5a3";
  const res = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('tests/sample_embed.html', html);
  console.log(`Saved ${html.length} bytes to tests/sample_embed.html`);
}

inspectHtml();
