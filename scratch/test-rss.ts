const urls = [
  "https://blog.google/rss/",
  "https://blog.google/technology/ai/rss/",
  "https://dev.to/feed/tag/translation",
  "https://dev.to/feed/tag/localization"
];

async function test() {
  for (const url of urls) {
    console.log(`Testing RSS Feed: ${url}`);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`SUCCESS! Snippet (first 150 chars): ${text.slice(0, 150)}`);
      } else {
        console.log(`FAILED! HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.log(`ERROR: ${err.message}`);
    }
    console.log("-----------------------------------------");
  }
}

test();
