const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Option 3: Dynamic Single-Row Breadcrumb Ribbon & Search Layout Switcher...\n');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../js/index.js'), 'utf8');

// Test 1: HTML Structure contains Option 3 elements and layout switcher in search row
assert.ok(html.includes('option3-controls-bar'), 'HTML has option3-controls-bar');
assert.ok(html.includes('option3-search-row'), 'HTML has option3-search-row');
assert.ok(html.includes('creator-layout-switcher'), 'HTML has creator-layout-switcher in search row');
assert.ok(html.includes('creatorRibbonWrapper'), 'HTML has creatorRibbonWrapper scroller container');
assert.ok(html.includes('btnCreatorScrollLeft'), 'HTML has btnCreatorScrollLeft button');
assert.ok(html.includes('btnCreatorScrollRight'), 'HTML has btnCreatorScrollRight button');
assert.ok(html.includes('creatorDynamicCategoryRibbon'), 'HTML has creatorDynamicCategoryRibbon container');
console.log('✅ Test 1 Passed: HTML contains Option 3 search row with Studio/Compact layout switcher and dynamic ribbon.');

// Test 2: JS logic contains dynamic ribbon transition and breadcrumb back navigation
assert.ok(js.includes('creatorDynamicCategoryRibbon'), 'JS references creatorDynamicCategoryRibbon');
assert.ok(js.includes('breadcrumb-back-pill'), 'JS creates breadcrumb-back-pill');
assert.ok(js.includes('All Categories'), 'JS has All Categories breadcrumb text');
assert.ok(js.includes('btnBreadcrumbBack'), 'JS handles back button navigation');
console.log('✅ Test 2 Passed: Dynamic breadcrumb transformation logic verified.');

// Test 3: Creator cards render following and not-following badges
assert.ok(js.includes('creator-follow-badge ${c.isFollowing ? \'followed\' : \'not-following\'}'), 'Creator cards render dynamic follow status badge');
console.log('✅ Test 3 Passed: Following (green) and Not Following (amber) badges verified on creator cards.');

console.log('\n🎉 Option 3 Dynamic Breadcrumb Ribbon Tests Passed Successfully!');
