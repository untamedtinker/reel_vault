import assert from 'node:assert';

console.log("🧪 Testing Embed HTML Parser...\n");

function parseInstagramEmbedHtml(html) {
  if (!html) return null;

  let authorUsername = null;
  let authorFullName = null;
  let createdAt = null;
  let caption = null;

  // Extract author username from Embed HTML
  // Pattern 1: class="EmbeddedMediaUser-username">username</div> or <a class="UsernameText"...>username</a>
  const usernameMatch = html.match(/class="(?:EmbeddedMediaUser-username|UsernameText|username)">([^<]+)</i) 
    || html.match(/class="EmbeddedMediaUser"[^>]*href="https:\/\/www\.instagram\.com\/([^\/\?"]+)/i)
    || html.match(/class="CaptionUsername"[^>]*>([^<]+)</i);

  if (usernameMatch) {
    authorUsername = usernameMatch[1].trim();
  }

  // Extract display / full name
  const nameMatch = html.match(/class="EmbeddedMediaUser-displayName">([^<]+)</i);
  if (nameMatch) {
    authorFullName = nameMatch[1].trim();
  }

  // Extract creation date from <time datetime="...">
  const timeMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
  if (timeMatch) {
    createdAt = timeMatch[1];
  }

  // Extract caption from <div class="Caption">
  const captionMatch = html.match(/<div class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
  if (captionMatch) {
    // Strip inner HTML tags
    caption = captionMatch[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
  }

  return {
    authorUsername,
    authorFullName,
    createdAt,
    caption
  };
}

// Sample Instagram embed HTML
const sampleEmbedHtml = `
<div class="EmbeddedMedia">
  <div class="EmbeddedMediaHeader">
    <a class="EmbeddedMediaUser" href="https://www.instagram.com/techcreator/">
      <div class="EmbeddedMediaUser-displayName">Tech Creator</div>
      <div class="EmbeddedMediaUser-username">techcreator</div>
    </a>
  </div>
  <time class="EmbeddedMediaTime" datetime="2026-08-25T16:20:00.000Z">Aug 25, 2026</time>
  <div class="Caption">
    <a class="CaptionUsername">techcreator</a>
    Check out this awesome #coding tutorial for #ai lovers!
  </div>
</div>
`;

const parsed = parseInstagramEmbedHtml(sampleEmbedHtml);
assert.strictEqual(parsed.authorUsername, "techcreator");
assert.strictEqual(parsed.authorFullName, "Tech Creator");
assert.strictEqual(parsed.createdAt, "2026-08-25T16:20:00.000Z");
assert(parsed.caption.includes("#coding"));

console.log("✅ Embed parser successfully extracted username, full name, timestamp, and caption!");
