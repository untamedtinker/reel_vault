const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("🧪 Testing Landing Page Architecture, Modularity & Compliance...");

const landingHtmlPath = path.join(__dirname, "../pages/landing.html");
const landingCssPath = path.join(__dirname, "../css/landing.css");
const landingJsPath = path.join(__dirname, "../js/landing.js");
const backgroundJsPath = path.join(__dirname, "../js/background.js");

assert(fs.existsSync(landingHtmlPath), "pages/landing.html must exist");
assert(fs.existsSync(landingCssPath), "css/landing.css must exist");
assert(fs.existsSync(landingJsPath), "js/landing.js must exist");

const landingHtml = fs.readFileSync(landingHtmlPath, "utf8");
const landingCss = fs.readFileSync(landingCssPath, "utf8");
const landingJs = fs.readFileSync(landingJsPath, "utf8");
const backgroundJs = fs.readFileSync(backgroundJsPath, "utf8");

// Test 1: Verify separation of concerns and zero inline styles/scripts
assert(!landingHtml.includes("<style>"), "Inline <style> tags are strictly prohibited");
assert(!landingHtml.includes("style="), "Inline style attributes are strictly prohibited");
assert(landingHtml.includes('href="../css/landing.css"'), "Must link dedicated external CSS");
assert(landingHtml.includes('src="../js/landing.js"'), "Must link dedicated external JS");
console.log("✅ Test 1 Passed: Separation of concerns and clean external linkage verified.");

// Test 2: Verify exclusion of search bar, connect storage pill, tabs, and category chip row
assert(!landingHtml.includes('id="searchInput"'), "Search input must not exist on landing page");
assert(!landingHtml.includes('class="search-box"'), "Search box container must not exist on landing page");
assert(!landingHtml.includes('class="storage-pill"'), "Storage pill must not exist on landing page");
assert(!landingHtml.includes('class="top-tabs"'), "Top nav tabs must not exist on landing page");
assert(!landingHtml.includes('id="chipRow"'), "Category chip row must not exist on landing page");
assert(!landingHtml.includes('class="controls"'), "Controls container must not exist on landing page");
assert(!landingHtml.includes("Storage: Connected"), "Connect storage text must not exist on landing page");
console.log("✅ Test 2 Passed: Prohibited elements (search bar, connect storage, tabs, category chips) verified absent.");

// Test 3: Verify zero em dashes or en dashes across landing assets
const emDashRegex = /[\u2014\u2013]/;
assert(!emDashRegex.test(landingHtml), "Em dashes or en dashes found in landing.html");
assert(!emDashRegex.test(landingCss), "Em dashes or en dashes found in landing.css");
assert(!emDashRegex.test(landingJs), "Em dashes or en dashes found in landing.js");
console.log("✅ Test 3 Passed: Strict prohibition of em dashes and en dashes verified.");

// Test 4: Verify placeholder folders and taxonomy category definitions
assert(landingJs.includes("PLACEHOLDER_FOLDERS"), "Placeholder folders structure defined");
assert(landingJs.includes("CATEGORIES"), "Category mappings defined");
assert(landingJs.includes("generateMosaicMarkup"), "Mosaic generator defined");
assert(landingJs.includes("generateCardMarkup"), "Card markup generator defined");
console.log("✅ Test 4 Passed: Placeholder structure and generator functions verified.");

// Test 5: Verify background.js directs to index.html (Posts view)
assert(backgroundJs.includes('chrome.runtime.getURL("index.html")'), "openDashboard must open index.html");
console.log("✅ Test 5 Passed: Extension navigation integration to posts dashboard verified.");

// Test 6: Verify kicker removal and sample stats presence
assert(!landingHtml.includes('class="kicker"'), "Kicker must be removed");
assert(landingHtml.includes('<b>48</b><span>Folders</span>'), "Must show 48 Folders stat");
assert(landingHtml.includes('<b>2,506</b><span>Saved posts</span>'), "Must show 2,506 Saved posts stat");
assert(landingHtml.includes('<b>987</b><span>Creators</span>'), "Must show 987 Creators stat");
console.log("✅ Test 6 Passed: Kicker absence and sample numbers verified.");

// Test 7: Verify absence of open-btn/panel and presence of professional folder names
assert(!landingJs.includes('class="open-btn"'), "Open button must be removed from card markup");
assert(!landingJs.includes('class="panel"'), "Expandable panel must be removed from card markup");
assert(landingJs.includes("AI Systems & LLMs"), "Professional folder names must be present");
assert(!landingJs.includes("Barcelona tech funding"), "Personal sample folder names must be replaced");
console.log("✅ Test 7 Passed: Card simplicity and professional folder names verified.");

console.log("\n🎉 All Landing Page Tests Passed Successfully!");
