async function testPostUrl() {
  const code = "DZkgG0IDHpH";
  const pUrl = `https://www.instagram.com/p/${code}/`;
  const reelUrl = `https://www.instagram.com/reel/${code}/`;

  console.log(`Checking /p/: ${pUrl}`);
  const pRes = await fetch(pUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    redirect: 'manual'
  });
  console.log(`/p/ Status: ${pRes.status}, Location: ${pRes.headers.get('location')}`);

  console.log(`\nChecking /reel/: ${reelUrl}`);
  const reelRes = await fetch(reelUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    redirect: 'manual'
  });
  console.log(`/reel/ Status: ${reelRes.status}, Location: ${reelRes.headers.get('location')}`);
}

testPostUrl();
