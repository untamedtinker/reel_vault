async function checkRedirects() {
  const code = "DXy60ZwADX7";
  const urls = [
    `https://www.instagram.com/reel/${code}/`,
    `https://www.instagram.com/p/${code}/`,
    `https://www.instagram.com/aiapply.co/reel/${code}/`
  ];

  for (const url of urls) {
    console.log(`\nTesting: ${url}`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        redirect: 'manual'
      });
      console.log(`Status: ${res.status}`);
      console.log(`Location Header:`, res.headers.get('location'));
    } catch (e) {
      console.log(e.message);
    }
  }
}

checkRedirects();
