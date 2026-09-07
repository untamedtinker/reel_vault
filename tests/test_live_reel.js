async function testFetchReel() {
  const shortcode = "Db4DLZIh5a3";
  console.log(`🔍 Fetching metadata for reel ${shortcode}...`);

  try {
    const res = await fetch(`https://www.instagram.com/p/${shortcode}/embed/captioned/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    console.log(`HTTP Status: ${res.status}`);
    const html = await res.text();
    
    // Extract author username
    const usernameMatch = html.match(/class="(?:EmbeddedMediaUser-username|UsernameText|username)">([^<]+)</i) 
      || html.match(/class="EmbeddedMediaUser"[^>]*href="https:\/\/www\.instagram\.com\/([^\/\?"]+)/i)
      || html.match(/class="CaptionUsername"[^>]*>([^<]+)</i);

    const nameMatch = html.match(/class="EmbeddedMediaUser-displayName">([^<]+)</i);
    const timeMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
    const captionMatch = html.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i);

    console.log("Parsed Details:");
    console.log(" - Author Username:", usernameMatch ? usernameMatch[1].trim() : "Not found");
    console.log(" - Author Full Name:", nameMatch ? nameMatch[1].trim() : "Not found");
    console.log(" - Created At:", timeMatch ? timeMatch[1] : "Not found");
    console.log(" - Caption Snippet:", captionMatch ? captionMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 100) : "Not found");
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testFetchReel();
