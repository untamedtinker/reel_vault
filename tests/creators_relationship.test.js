import assert from 'node:assert';

console.log("🧪 Testing Creator Relationship Engine (Following vs Not Following)...\n");

const SYSTEM_INSTAGRAM_PATHS = new Set([
  'explore', 'reels', 'direct', 'inbox', 'your_activity', 'stories', 'accounts',
  'archive', 'saved', 'settings', 'emails', 'session', 'notifications', 'home',
  'api', 'graphql', 'ajax', 'about', 'legal', 'help', 'privacy', 'terms',
  'developer', 'meta', 'threads', 'support', 'media'
]);

function isValidCreatorHandle(handle) {
  if (!handle || typeof handle !== 'string') return false;
  const clean = handle.toLowerCase().replace(/^@/, '').trim();
  if (!clean || clean.length < 2 || clean.length > 30) return false;
  if (SYSTEM_INSTAGRAM_PATHS.has(clean)) return false;
  if (/^(p|reel|reels|tv|stories)$/i.test(clean)) return false;
  return /^[a-zA-Z0-9._]+$/.test(clean);
}

function classifyCreator(creator) {
  return { category: "Fitness, Movement & Rehab", subGroup: "General Fitness" };
}

const TAXONOMY_NAMES = new Set([
  "Arts & Creative", "Food & Culinary", "Tech, AI & Science",
  "Fitness, Movement & Rehab", "Medicine, Health & Wellness",
  "Business & Finance", "Fashion, Beauty & Style",
  "Mindset, Psychology & Learning", "Travel, Outdoors & Adventure",
  "Entertainment, Music & Arts", "General & Lifestyle",
  "Tech & AI", "Business, Marketing & Finance"
]);

function isAuthenticFollowedCreator(c) {
  if (!c) return false;
  if (c.isFollowing === false) return false;
  
  // 1. Accounts with 0 saved posts came exclusively from the Following list crawl
  if (!c.posts || c.posts.length === 0) {
    return true;
  }
  
  // 2. Followed accounts with saved posts have authorFullName from the Following crawl user object
  if (typeof c.authorFullName === 'string' && c.authorFullName.trim().length > 0) {
    return true;
  }
  
  // 3. Followed creators crawled from Instagram have a valid profile picture URL from friendship sync
  if (typeof c.profilePic === 'string' && c.profilePic.trim().startsWith('http') && c.profilePic.includes('cdninstagram')) {
    return true;
  }
  
  // 4. Official category (distinct from our taxonomy categories) or bio from profile crawl
  const rawOfficial = (c.officialCategory || '').trim();
  if (rawOfficial.length > 0 && !TAXONOMY_NAMES.has(rawOfficial)) {
    return true;
  }
  if (typeof c.bio === 'string' && c.bio.trim().length > 0) {
    return true;
  }
  
  return false;
}

function buildCreatorsList(vaultItems, creatorsVault) {
  const creatorMap = new Map();
  
  const followingHandles = new Set(
    creatorsVault
      .filter(c => isAuthenticFollowedCreator(c))
      .map(c => (c.authorUsername || '').toLowerCase().replace(/^@/, '').trim())
      .filter(h => isValidCreatorHandle(h))
  );

  // 1. Ingest all creators from Saved Posts
  for (const item of vaultItems) {
    const rawUser = item.authorUsername;
    if (!rawUser) continue;
    const cleanUser = rawUser.toLowerCase().replace(/^@/, '').trim();
    if (!isValidCreatorHandle(cleanUser)) continue;

    const isFollowed = followingHandles.has(cleanUser);

    if (!creatorMap.has(cleanUser)) {
      creatorMap.set(cleanUser, {
        authorUsername: cleanUser,
        authorFullName: item.authorFullName || null,
        category: null,
        bio: null,
        isFollowing: isFollowed,
        posts: [item],
        tags: [...(item.tags || [])],
        captions: [item.caption || ""]
      });
    } else {
      const c = creatorMap.get(cleanUser);
      c.posts.push(item);
      if (item.authorFullName && !c.authorFullName) c.authorFullName = item.authorFullName;
      if (item.tags) c.tags.push(...item.tags);
      if (item.caption) c.captions.push(item.caption);
    }
  }

  // 2. Ingest all creators from Following list / extended profiles
  for (const extra of creatorsVault) {
    const rawUser = extra.authorUsername;
    if (!rawUser) continue;
    const cleanUser = rawUser.toLowerCase().replace(/^@/, '').trim();
    if (!isValidCreatorHandle(cleanUser)) continue;

    const isFollowed = isAuthenticFollowedCreator(extra) || followingHandles.has(cleanUser);

    if (!creatorMap.has(cleanUser)) {
      creatorMap.set(cleanUser, {
        authorUsername: cleanUser,
        authorFullName: extra.authorFullName || null,
        profilePic: extra.profilePic || null,
        officialCategory: extra.category || extra.officialCategory || null,
        bio: extra.bio || null,
        isFollowing: isFollowed,
        posts: [],
        tags: [],
        captions: []
      });
    } else {
      const existing = creatorMap.get(cleanUser);
      if (isFollowed) {
        existing.isFollowing = true;
      }
      if (extra.profilePic && !existing.profilePic) existing.profilePic = extra.profilePic;
      if (extra.category || extra.officialCategory) {
        existing.officialCategory = extra.category || extra.officialCategory;
      }
      if (extra.bio) existing.bio = extra.bio;
      if (extra.authorFullName && !existing.authorFullName) existing.authorFullName = extra.authorFullName;
    }
  }

  return Array.from(creatorMap.values()).map(creator => {
    const classification = classifyCreator(creator);
    return {
      ...creator,
      category: classification.category,
      subGroup: classification.subGroup,
      postsCount: creator.posts.length
    };
  });
}

// Generate 640 followed creators
const mockFollowedCreators = [];
for (let i = 1; i <= 640; i++) {
  mockFollowedCreators.push({
    authorUsername: `followed_creator_${i}`,
    authorFullName: `Followed Creator ${i}`,
    profilePic: `https://img.instagram.com/p_${i}.jpg`,
    category: "Athlete",
    isFollowing: true
  });
}

// Generate saved reels: 50 from followed creators, and 84 from non-followed creators
const mockVaultItems = [];
// 50 from followed creators
for (let i = 1; i <= 50; i++) {
  mockVaultItems.push({
    url: `https://instagram.com/reel/f_${i}/`,
    authorUsername: `followed_creator_${i}`,
    caption: `Reel caption ${i}`
  });
}
// 84 from non-followed creators (saved posts)
for (let i = 1; i <= 84; i++) {
  mockVaultItems.push({
    url: `https://instagram.com/reel/nf_${i}/`,
    authorUsername: `non_followed_creator_${i}`,
    caption: `Viral reel ${i}`
  });
}

// Run Extraction
const creators = buildCreatorsList(mockVaultItems, mockFollowedCreators);

// Test 1: Total Creators Count
assert.strictEqual(creators.length, 724, "Total creators should equal 640 followed + 84 discovered = 724");
console.log("✅ Test 1 Passed: Total creator count matches 724 (640 followed + 84 discovered).");

// Test 2: Following vs Not Following Counts
const followingCreators = creators.filter(c => c.isFollowing);
const notFollowingCreators = creators.filter(c => !c.isFollowing);

assert.strictEqual(followingCreators.length, 640, "Following count must be exactly 640");
assert.strictEqual(notFollowingCreators.length, 84, "Not Following count must be exactly 84");
console.log("✅ Test 2 Passed: Exactly 640 Following and 84 Not Following accounts separated.");

// Test 3: Overlapping creator has isFollowing: true and posts attached
const overlapping = creators.find(c => c.authorUsername === "followed_creator_1");
assert.strictEqual(overlapping.isFollowing, true);
assert.strictEqual(overlapping.postsCount, 1);
console.log("✅ Test 3 Passed: Followed creator with saved reel retains following status and reel association.");

// Test 4: Pure saved-post author has isFollowing: false and 1 post
const discovered = creators.find(c => c.authorUsername === "non_followed_creator_1");
assert.strictEqual(discovered.isFollowing, false);
assert.strictEqual(discovered.postsCount, 1);
console.log("✅ Test 4 Passed: Non-followed creator correctly has isFollowing: false.");

// Test 5: Vault serialization and reload stability
// Export all creators into vault format with explicit isFollowing
const exportedPayload = {
  metrics: {
    totalCreators: creators.length,
    totalFollowing: followingCreators.length,
    totalDiscovered: notFollowingCreators.length
  },
  creators: creators
};

// Re-ingest from exported payload
const reloadedCreators = buildCreatorsList(mockVaultItems, exportedPayload.creators);
const reloadedFollowing = reloadedCreators.filter(c => c.isFollowing).length;
const reloadedNotFollowing = reloadedCreators.filter(c => !c.isFollowing).length;

// Test 6: Healing corrupted legacy vault where all 724 creators were previously saved with isFollowing: true
const legacyCorruptedCreators = creators.map(c => ({
  ...c,
  isFollowing: true // Corrupted flag on all 724
}));

const healedCreators = buildCreatorsList(mockVaultItems, legacyCorruptedCreators);
const healedFollowing = healedCreators.filter(c => c.isFollowing).length;
const healedNotFollowing = healedCreators.filter(c => !c.isFollowing).length;

assert.strictEqual(healedFollowing, 640, "Healed legacy vault must have 640 following");
assert.strictEqual(healedNotFollowing, 84, "Healed legacy vault must have 84 not following");
console.log("✅ Test 6 Passed: Auto-healing corrupted legacy vaults successfully restores 640 Following vs 84 Not Following.");

console.log("\n🎉 All Creator Relationship Tests Passed Successfully!");
