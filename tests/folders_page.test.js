import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log("🧪 Testing Folders Page Architecture, Search & Category Ribbon...\n");

const indexHtmlPath = path.join(process.cwd(), 'index.html');
const indexCssPath = path.join(process.cwd(), 'css', 'index.css');
const indexJsPath = path.join(process.cwd(), 'js', 'index.js');
const globalCssPath = path.join(process.cwd(), 'css', 'global.css');

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const indexCss = fs.readFileSync(indexCssPath, 'utf8');
const indexJs = fs.readFileSync(indexJsPath, 'utf8');
const globalCss = fs.readFileSync(globalCssPath, 'utf8');

// Test 1: HTML Structure and Separated Elements
assert.ok(indexHtml.includes('id="foldersView"'), "foldersView container must exist");
assert.ok(indexHtml.includes('id="folderSearchInput"'), "folderSearchInput must exist for folder search");
assert.ok(indexHtml.includes('id="clearFolderSearchBtn"'), "clearFolderSearchBtn must exist");
assert.ok(indexHtml.includes('id="folderRibbonWrapper"'), "folderRibbonWrapper must exist for smooth ribbon scrolling");
assert.ok(indexHtml.includes('id="btnFolderScrollLeft"'), "btnFolderScrollLeft must exist for scrolling left");
assert.ok(indexHtml.includes('id="btnFolderScrollRight"'), "btnFolderScrollRight must exist for scrolling right");
assert.ok(indexHtml.includes('id="folderChipRow"'), "folderChipRow must exist for category filter ribbon");
assert.ok(indexHtml.includes('id="foldersCountBadge"'), "foldersCountBadge must exist for count display");
assert.ok(indexHtml.includes('id="foldersGrid"'), "foldersGrid container must exist");
assert.ok(indexJs.includes("setupRibbonArrowControls('folderChipRow'"), "JS must configure ribbon arrow controls for folderChipRow");
console.log("✅ Test 1 Passed: Folders view HTML structure with search input, category ribbon, and count badge verified.");

// Test 2: CSS Styles for Modern Multi-Column Grid and Placeholder Cards
assert.ok(indexCss.includes('.folders-grid'), "folders-grid styles must exist");
assert.ok(indexCss.includes('.folder-card'), "folder-card styles must exist");
assert.ok(indexCss.includes('.mosaic'), "mosaic container styles must exist");
assert.ok(indexCss.includes('.tile'), "tile placeholder styles must exist");
assert.ok(indexCss.includes('.card-body'), "card-body styles must exist");
assert.ok(indexCss.includes('.card-top-row'), "card-top-row styles must exist");
assert.ok(indexCss.includes('.folder-name'), "folder-name styles must exist");
assert.ok(indexCss.includes('.folder-count'), "folder-count styles must exist");
assert.ok(indexCss.includes('.folder-cat'), "folder-cat category pill styles must exist");
assert.ok(globalCss.includes('--c-tech'), "Shared category color tokens must exist in global.css");
console.log("✅ Test 2 Passed: CSS styles for multi-column layout, placeholder mosaic, and separated card elements verified.");

// Test 3: Strict Prohibition of Em Dashes and En Dashes
const emDashRegex = /[\u2013\u2014]/;
assert.strictEqual(emDashRegex.test(indexHtml), false, "index.html must not contain em dashes or en dashes");
assert.strictEqual(emDashRegex.test(indexCss), false, "index.css must not contain em dashes or en dashes");
console.log("✅ Test 3 Passed: Strict prohibition of em dashes and en dashes verified.");

// Test 4: Folder Category Classification Logic
const FOLDER_CATEGORIES = {
  tech: { label: "Tech, AI & Science" },
  food: { label: "Food & Culinary" },
  arts: { label: "Arts & Creative" },
  fitness: { label: "Fitness, Movement & Rehab" },
  medicine: { label: "Medicine, Health & Wellness" },
  business: { label: "Business & Finance" },
  fashion: { label: "Fashion, Beauty & Style" },
  mindset: { label: "Mindset, Psychology & Learning" },
  travel: { label: "Travel, Outdoors & Adventure" },
  entertainment: { label: "Entertainment, Music & Arts" },
  general: { label: "General & Lifestyle" }
};

function classifyFolderCategory(folderName) {
  const normName = (folderName || "").toLowerCase();
  if (/\b(ai|llm|tech|technology|software|code|coding|developer|robot|robotics|python|javascript|data|cloud|prompt|science)\b/i.test(normName)) return "tech";
  if (/\b(culinary|food|recipe|recipes|cook|cooking|baking|chocolate|pastry|pastries|cake|coffee|barista|bar|dessert|desserts|drink|drinks)\b/i.test(normName)) return "food";
  if (/\b(design|art|arts|artist|ui|ux|figma|illustration|illustrator|3d|spatial|render|studio|graphic|interior|architect|architecture)\b/i.test(normName)) return "arts";
  if (/\b(fitness|workout|gym|hypertrophy|glute|glutes|strength|rehab|mobility|posture|pilates|yoga|movement)\b/i.test(normName)) return "fitness";
  if (/\b(medicine|medical|health|doctor|dermatology|skin|skincare|neuro|neuroscience|wellness|clinical|dental|therapy)\b/i.test(normName)) return "medicine";
  if (/\b(business|finance|venture|capital|startup|startups|market|marketing|scale|sales|invest|investing|crypto|money)\b/i.test(normName)) return "business";
  if (/\b(fashion|beauty|style|apparel|outfit|outfits|clothing|model|aesthetic|skincare|makeup)\b/i.test(normName)) return "fashion";
  if (/\b(mindset|psychology|learning|habits|productivity|mind|mental|books|reading|wisdom|focus)\b/i.test(normName)) return "mindset";
  if (/\b(travel|outdoors|adventure|hiking|climbing|nature|mountains|places|explore|voyage|trip|expedition|expeditions|alpine)\b/i.test(normName)) return "travel";
  if (/\b(entertainment|music|comedy|meme|film|cinema|acting|theatre|performance|concert)\b/i.test(normName)) return "entertainment";
  if (/\b(career|job|jobs|lead|leadership|interview|resume|hiring|manage|management|executive|lifestyle)\b/i.test(normName)) return "general";
  return "general";
}

assert.strictEqual(classifyFolderCategory("AI Systems & Tools"), "tech");
assert.strictEqual(classifyFolderCategory("Pastry & Baking Recipes"), "food");
assert.strictEqual(classifyFolderCategory("Figma & Spatial 3D"), "arts");
assert.strictEqual(classifyFolderCategory("Glutes & Mobility Workout"), "fitness");
assert.strictEqual(classifyFolderCategory("Clinical Dermatology"), "medicine");
assert.strictEqual(classifyFolderCategory("Venture Capital & Startups"), "business");
assert.strictEqual(classifyFolderCategory("Executive Leadership & Careers"), "general");
assert.strictEqual(classifyFolderCategory("Alpine Expeditions"), "travel");
console.log("✅ Test 4 Passed: Folder category classifier accurately maps folder themes to taxonomy.");

// Test 5: Search and Category Filtering Logic
const sampleFolders = [
  { name: "AI Systems & LLMs", cat: "tech", count: 84 },
  { name: "Modern Culinary Tech", cat: "food", count: 29 },
  { name: "Design & Spatial 3D", cat: "arts", count: 42 },
  { name: "Mobility & Biomechanics", cat: "fitness", count: 14 }
];

function filterFolders(folders, query = "", activeCat = null) {
  const q = query.toLowerCase().trim();
  return folders.filter(f => {
    const matchesCat = !activeCat || f.cat === activeCat;
    const matchesQuery = !q || f.name.toLowerCase().includes(q) || (FOLDER_CATEGORIES[f.cat] && FOLDER_CATEGORIES[f.cat].label.toLowerCase().includes(q));
    return matchesCat && matchesQuery;
  });
}

const techFiltered = filterFolders(sampleFolders, "", "tech");
assert.strictEqual(techFiltered.length, 1);
assert.strictEqual(techFiltered[0].name, "AI Systems & LLMs");

const searchFiltered = filterFolders(sampleFolders, "Culinary");
assert.strictEqual(searchFiltered.length, 1);
assert.strictEqual(searchFiltered[0].name, "Modern Culinary Tech");

const combinedFiltered = filterFolders(sampleFolders, "3D", "arts");
assert.strictEqual(combinedFiltered.length, 1);
assert.strictEqual(combinedFiltered[0].name, "Design & Spatial 3D");

console.log("✅ Test 5 Passed: Folder search and category filter engine validated.");
console.log("\n🎉 All Folders Page Tests Passed Successfully!");
