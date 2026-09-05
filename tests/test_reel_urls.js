async function testReelUrl() {
  const code = "Db4DLZIh5a3";
  const urls = [
    `https://www.instagram.com/reel/${code}/embed/captioned/`,
    `https://www.instagram.com/api/v1/oembed/?url=https://www.instagram.com/reel/${code}/`,
    `https://api.instagram.com/oembed?url=https://www.instagram.com/reel/${code}/`
  ];

  for (const url of urls) {
    try {
      console.log(`\nTesting URL: ${url}`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Length: ${text.length}`);
        if (text.startsWith('{')) {
          console.log("JSON response:", text.slice(0, 300));
        } else if (!text.includes("httpErrorPage")) {
          console.log("Found real HTML content!");
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

testReelUrl();
