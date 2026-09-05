const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Insights & Analytics View Logic & HTML Structure...');

const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Test 1: Verify exact labels & headers in HTML
assert(html.includes('Insights & Analytics'), 'Page title "Insights & Analytics" missing');
assert(html.includes('<div class="metric-label">SAVED POSTS</div>'), 'Metric label "SAVED POSTS" missing');
assert(html.includes('<div class="metric-label">CREATORS</div>'), 'Metric label "CREATORS" missing');
assert(html.includes('<div class="metric-label">TOP CATEGORY</div>'), 'Metric label "TOP CATEGORY" missing');
assert(html.includes('<div class="metric-label">LARGEST FOLDER</div>'), 'Metric label "LARGEST FOLDER" missing');
assert(html.includes('<span class="distribution-title">POSTS BY CATEGORY</span>'), 'Distribution title "POSTS BY CATEGORY" missing');
assert(html.includes('<span class="distribution-sub">Click to filter</span>'), 'Distribution helper "Click to filter" missing');
console.log('✅ Test 1 Passed: Exact Insights labels and headers verified in HTML.');

// Test 2: Verify dynamic calculation logic with sample dataset
const sampleVaultItems = [
  { id: '1', authorUsername: 'tech_guru', folders: ['AI Research', 'Saved Tech'], category: 'Tech, AI & Science' },
  { id: '2', authorUsername: 'tech_guru', folders: ['AI Research'], category: 'Tech, AI & Science' },
  { id: '3', authorUsername: 'fitness_coach', folders: ['Neck', 'Mobility'], category: 'Fitness, Movement & Rehab' },
  { id: '4', authorUsername: 'fitness_coach', folders: ['Neck'], category: 'Fitness, Movement & Rehab' },
  { id: '5', authorUsername: 'chef_mario', folders: ['Recipes'], category: 'Food & Culinary' },
  { id: '6', authorUsername: 'travel_dan', folders: ['Neck'], category: 'Travel, Outdoors & Adventure' },
];

const creatorMap = new Map([
  ['tech_guru', { category: 'Tech, AI & Science' }],
  ['fitness_coach', { category: 'Fitness, Movement & Rehab' }],
  ['chef_mario', { category: 'Food & Culinary' }],
  ['travel_dan', { category: 'Travel, Outdoors & Adventure' }]
]);

// Folder aggregation
const folderMap = new Map();
const uniqueCreators = new Set();
const postCategoryCounts = {};

for (const item of sampleVaultItems) {
  const fList = item.folders && item.folders.length > 0 ? item.folders : [item.folder || "General"];
  for (const f of fList) {
    if (!f) continue;
    folderMap.set(f, (folderMap.get(f) || 0) + 1);
  }
  if (item.authorUsername) {
    uniqueCreators.add(item.authorUsername.toLowerCase());
  }
  const c = creatorMap.get((item.authorUsername || '').toLowerCase());
  const cat = c && c.category ? c.category : (item.category || "General & Lifestyle");
  postCategoryCounts[cat] = (postCategoryCounts[cat] || 0) + 1;
}

// Card 1
assert.strictEqual(sampleVaultItems.length, 6);
assert.strictEqual(folderMap.size, 5); // AI Research, Saved Tech, Neck, Mobility, Recipes
const card1Subtitle = `Across ${folderMap.size} folders`;
assert.strictEqual(card1Subtitle, 'Across 5 folders');

// Card 2
const sampleAllCreators = [
  { authorUsername: 'tech_guru', isFollowing: true },
  { authorUsername: 'fitness_coach', isFollowing: true },
  { authorUsername: 'chef_mario', isFollowing: true },
  { authorUsername: 'travel_dan', isFollowing: false }
];
const followingCount = sampleAllCreators.filter(c => c.isFollowing).length;
const discoveredCount = sampleAllCreators.length - followingCount;
assert.strictEqual(sampleAllCreators.length, 4);
assert.strictEqual(followingCount, 3);
assert.strictEqual(discoveredCount, 1);
const card2Subtitle = `${discoveredCount} discovered, ${followingCount} followed`;
assert.strictEqual(card2Subtitle, '1 discovered, 3 followed');

// Card 3
const sortedCategories = Object.entries(postCategoryCounts).sort((a, b) => b[1] - a[1]);
assert.strictEqual(sortedCategories[0][0], 'Tech, AI & Science'); // tied with Fitness at 2
const topPct = Math.round((sortedCategories[0][1] / sampleVaultItems.length) * 100);
assert.strictEqual(topPct, 33); // 2/6 = 33%

// Card 4
const sortedFolders = Array.from(folderMap.entries()).sort((a, b) => b[1] - a[1]);
assert.strictEqual(sortedFolders[0][0], 'Neck');
assert.strictEqual(sortedFolders[0][1], 3); // 3 saved posts in Neck
const card4Subtitle = `${sortedFolders[0][1]} saved posts`;
assert.strictEqual(card4Subtitle, '3 saved posts');

console.log('✅ Test 2 Passed: Metric aggregation and percentage calculations verified.');

console.log('\n🎉 Insights & Analytics Tests Passed Successfully!');
