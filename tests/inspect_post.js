async function getPostDetails() {
  const code = "DZkgG0IDHpH";
  const res = await fetch(`https://www.instagram.com/p/${code}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  const html = await res.text();
  
  // Extract meta title & description
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i) || html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);

  console.log("Title:", titleMatch ? titleMatch[1] : "N/A");
  console.log("OG Title:", ogTitleMatch ? ogTitleMatch[1] : "N/A");
  console.log("Description:", descMatch ? descMatch[1].slice(0, 150) : "N/A");
}

getPostDetails();
