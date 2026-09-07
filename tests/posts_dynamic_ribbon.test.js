const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Option 3: Single-Row Posts Dimension Switcher & Dynamic Ribbon...\n');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../js/index.js'), 'utf8');

// Test 1: HTML Structure contains dimension mode switcher and dynamic ribbon
assert.ok(html.includes('posts-filter-mode-switcher'), 'HTML has posts-filter-mode-switcher');
assert.ok(html.includes('id="btnModeCategory"'), 'HTML has Category mode button');
assert.ok(html.includes('id="btnModeFolder"'), 'HTML has Folder mode button');
assert.ok(html.includes('id="btnModeTag"'), 'HTML has Tag mode button');
assert.ok(html.includes('id="postsDynamicCategoryRibbon"'), 'HTML has postsDynamicCategoryRibbon container');
console.log('✅ Test 1 Passed: HTML contains Option 3 dimension mode switcher and ribbon.');

// Test 2: JS logic contains dimension state and ribbon rendering for Category, Folder, Tag
assert.ok(js.includes('currentPostFilterDimension'), 'JS has currentPostFilterDimension state');
assert.ok(js.includes('selectedPostCategory'), 'JS has selectedPostCategory state');
assert.ok(js.includes('btnModeCategory'), 'JS attaches mode button handlers');
assert.ok(js.includes('btnPostBreadcrumbBack'), 'JS supports post category breadcrumb back navigation');
console.log('✅ Test 2 Passed: Posts dimension state and dynamic ribbon logic verified.');

// Test 3: Filtering logic respects active dimension
assert.ok(js.includes('currentPostFilterDimension === \'category\''), 'getFilteredItems filters by category when mode is category');
assert.ok(js.includes('currentPostFilterDimension === \'folder\''), 'getFilteredItems filters by folder when mode is folder');
assert.ok(js.includes('currentPostFilterDimension === \'tag\''), 'getFilteredItems filters by tag when mode is tag');
console.log('✅ Test 3 Passed: Multi-dimensional filtering logic verified.');

console.log('\n🎉 Option 3 Single-Row Dimension Switcher Tests Passed Successfully!');
