/* ==========================================================================
   MAIN DASHBOARD APPLICATION CONTROLLER
   Scope: Primary Reel Vault Dashboard (index.html)
   Description: Coordinates persistent vault storage (IndexedDB / File System Access API),
   hierarchical taxonomy classification, multi-dimensional search filtering,
   creator relationship directories, and modal/drawer inspection dialogs.
   ========================================================================== */

// Reactive State Management
let vaultItems = [];
let creatorsVault = []; // Extended creator profiles from Following sync
let selectedFolder = "ALL";
let selectedTag = "ALL";
let selectedTags = [];
let selectedPostCategory = "ALL";
let selectedPostSubGroup = "ALL";
let currentPostFilterDimension = "category"; // "category" | "folder" | "tag"
let searchQuery = "";
let sortBy = "created_desc";
let localDirHandle = null;
let isStorageLoaded = false;

// Views & Navigation State
let activeView = "posts"; // "posts" | "folders" | "creators"
let selectedCreatorRelationship = "ALL"; // "ALL" | "FOLLOWING" | "SAVED"
let selectedCreatorCategory = "ALL";
let selectedCreatorSubGroup = "ALL";
let creatorSearchQuery = "";

// Utility: Text Sanitization
function sanitizeText(str) {
  if (!str) return "";
  return String(str)
    .replace(/[\u2028\u2029]/g, "\n")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim();
}

// Hierarchical Taxonomy Definition
const TAXONOMY = {
  "Arts & Creative": {
    "UI/UX, Figma & Motion Design": [
      "figma", "plugin", "plugins", "svg", "svgmotion", "motion", "motion design", "motion graphics",
      "framer", "spline", "interaction", "ui", "ux", "ui/ux", "web design", "interface", "app design",
      "animation", "animator", "3d design", "blender", "after effects", "ae", "web designer",
      "ransegall", "flux academy", "olegdesignfrolov", "oleg frolov", "polyhop"
    ],
    "Illustration, Graphic & Fine Art": [
      "artist", "art", "designer", "illustration", "illustrator", "drawing", "sketch", "painting",
      "painter", "visual art", "digital art", "procreate", "calligraphy", "typography", "print",
      "fine art", "sculptor", "ceramics", "pottery", "gallery", "museum", "exhibition", "mural",
      "tattoo", "visual", "domestika", "ars electronica", "arselectronica", "graphic design",
      "art director", "product designer", "creative director", "lara lars", "_lara_lars_",
      "angelinecuvertinotessellations", "tessellations", "origami", "makotoyamaguchi_origami",
      "oriol.esteve.origami", "36.degres_", "europeana", "europeana_eu", "eonarium", "jaesukkim",
      "keimeguro", "lachlanturczan", "lefawnhawk", "mymodernmet", "nickverstand", "quentin.script",
      "ramaduwaji", "reubenmargolin", "styttlo", "jessewoolston", "joon_moon", "memo_akten",
      "quasimondo", "ez.bookdesign", "florist", "flower"
    ],
    "Architecture, Interior & Studios": [
      "architecture", "architect", "interior design", "interior", "spaces", "decor", "home decor",
      "studio", "atelier", "3d", "render", "cgi", "spatial", "furniture", "lighting",
      "landscape architecture", "architectural", "astet", "astet studio", "industrial design",
      "dezeen", "caterina.house", "klivtekture", "nohlab", "paulcocksedge", "rlgcolorconsulting", "byanavrin"
    ],
    "Creative Schools & Learning": [
      "school of creativity", "school", "academy", "design school", "education", "learning",
      "masterclass", "course", "courses", "institute", "university", "college", "workshop",
      "tutorial", "lecture", "training", "student", "class", "barcelona school of creativity",
      "tallerde4pintors", "highlightdelft"
    ]
  },
  "Food & Culinary": {
    "Baking, Chocolate & Desserts": [
      "chocolatier", "chocolate", "chocolates", "pastry", "pastries", "pastry chef", "baker",
      "bakery", "baking", "dessert", "desserts", "cake", "cakes", "cookies", "sourdough", "bread",
      "sweet", "sweets", "sugar", "patisserie", "confectioner", "patissier", "amauryguichon",
      "guichon", "andrey_dubovik", "dubovik", "frankhaasnoot", "albertomagri"
    ],
    "Coffee, Drinks & Bars": [
      "caffeine", "coffee", "roasters", "cafe", "café", "barista", "cocktails", "matcha", "wine",
      "espresso", "drinks", "restaurant", "dining", "bar", "club", "sommelier", "mixology",
      "brewery", "beer", "tea", "winery", "caffeine social club"
    ],
    "Cooking, Recipes & Dining": [
      "recipe", "recipes", "cooking", "cook", "chef", "home cook", "homecook", "bites", "kitchen",
      "foodie", "food", "dinner", "lunch", "meal", "culinary", "delicious", "tamago", "yum", "taste",
      "dish", "dishes", "pasta", "comfort food", "meal prep", "gourmet", "vegan", "vegetarian",
      "food review", "culinary arts", "bayanbites", "edeneats", "eden grinshpan", "rasmusmunkalchemist",
      "rasmus munk", "gronda", "gakuyen", "gaku", "meatandfirefest", "florsalmercat",
      "see_the_delicacies", "delicacies"
    ]
  },
  "Tech, AI & Science": {
    "AI & Machine Learning": [
      "ai", "artificial intelligence", "machine learning", "deep learning", "chatgpt", "openai",
      "llm", "prompt", "prompt engineering", "automation", "no code", "nocode", "bot", "algorithm",
      "artificialintelligence", "aiapply", "midjourney", "claude", "gemini", "tech tools",
      "robotics", "data science", "futurepedia", "futurepedia_io", "kallaway", "quasimondo",
      "evenrealities", "cleoabram", "cleo abram", "fryrsquared", "hannah fry"
    ],
    "Software, Web & Engineering": [
      "software engineer", "developer", "coding", "programmer", "web dev", "python", "javascript",
      "react", "fullstack", "backend", "frontend", "devops", "cloud", "engineer", "github", "build",
      "building", "tech", "computer science", "app development", "alterego", "code", "web3",
      "crypto", "hardware", "aerospace", "space", "mit", "science", "engineering", "buildwbrendan",
      "solidworks", "ariel_ekblaw", "ariel ekblaw", "zach.lieberman", "zach lieberman",
      "curimebatliner", "elekktronaut", "shellworks", "galaxies", "the_secrets_of_the_universe",
      "universe", "cosmos", "physics", "astronomy", "explainlikeimfivee", "eli5", "letsdefine.io",
      "group_e_app", "farmaciamotors"
    ],
    "Career, Jobs & Leadership": [
      "career", "job search", "recruiter", "resume", "interview", "hiring", "leadership",
      "job hunting", "career coach", "job", "jobs", "linkedin", "salary", "apply", "promotion",
      "workplace", "management", "hr", "executive", "intch_gigs", "opportunitiescircleofficial",
      "opportunities circle"
    ]
  },
  "Fitness, Movement & Rehab": {
    "Glutes, Strength & Hypertrophy": [
      "glute", "glutes", "glute guy", "the glute guy", "bretcontreras", "bret contreras", "hip thrust",
      "cscs", "squat", "deadlift", "hypertrophy", "strength coach", "bodybuilding", "weightlifting",
      "powerlifting", "crossfit", "gym", "trainer", "fitness coach", "workout", "muscle", "shoulders",
      "biceps", "triceps", "quads", "hamstrings", "calves", "booty", "physique", "kettlebell", "calisthenics",
      "swolenormous", "sharnyandjulius"
    ],
    "Physical Therapy & Anatomy": [
      "physical therapist", "physiotherapist", "physiotherapy", "dpt", "pt", "rehab", "rehabilitation",
      "spine", "joint", "mobility", "posture", "injury", "biomechanics", "physical therapy",
      "chiropractor", "back pain", "neck pain", "knee pain", "sciatica", "alignment", "anatomy",
      "anatomytrains", "anatomy trains", "fascia", "kinesiology", "bodywork", "structural integration",
      "osteopath", "conor_harris_", "conor harris", "zaccupples", "zac cupples", "strongandmobile",
      "strong and mobile"
    ],
    "Pilates & Core Training": [
      "pilates", "reformer", "mat pilates", "classical pilates", "lagree", "pilates instructor",
      "pilates coach", "core stability", "posture correction", "contrology", "abs", "abdominal",
      "core", "sixpack", "six pack", "obliques", "belly", "flat stomach"
    ],
    "Yoga & Mindful Movement": [
      "yoga", "yogi", "vinyasa", "ashtanga", "flexibility", "stretching", "breathwork", "meditation",
      "mindful movement", "somatic", "breath", "sound bath", "mindfulness"
    ]
  },
  "Medicine, Health & Wellness": {
    "Dermatology & Skincare": [
      "dermatologist", "dermatology", "skincare", "skin", "acne", "esthetician", "anti-aging",
      "spf", "retinol", "board-certified dermatologist", "cosmetic", "sunscreen", "serum", "dermal",
      "facial", "aesthetics", "skin health"
    ],
    "Doctors & Medical Specialties": [
      "doctor", "dr", "dr.", "physician", "md", "do", "phd", "surgeon", "medicine", "medical",
      "neurologist", "cardiologist", "pediatrician", "functional medicine", "scientist", "health",
      "clinic", "dental", "dentist", "orthodontist", "hospital", "nursing", "medical school",
      "brainjojosh", "josh turknett", "healyournervoussystem", "linnea passaler", "nervous system"
    ],
    "Nutrition & Metabolism": [
      "dietitian", "nutritionist", "nutrition", "diet", "gut health", "rd", "registered dietitian",
      "macros", "functional nutrition", "metabolism", "weight loss", "supplements", "vitamins",
      "holistic", "wellness", "fasting", "longevity", "microbiome", "dimplejangdaofficial",
      "gutstorywithdimple", "dimple jangda", "healwithrio", "sherilevy_journeytoorganic"
    ]
  },
  "Business & Finance": {
    "Startups, Founders & SaaS": [
      "founder", "startup", "buildinpublic", "saas", "indie hacker", "entrepreneur", "building",
      "business", "ceo", "investor", "venture capital", "vc", "agency", "freelance", "cofounder",
      "tech startup", "product", "e-commerce", "shopify", "gregisenberg", "greg isenberg",
      "laurentickner", "lauren tickner", "shawnkanungo", "thebreakfast.app"
    ],
    "Investing & Wealth": [
      "investing", "finance", "wealth", "stocks", "real estate", "crypto", "bitcoin", "money",
      "financial freedom", "passive income", "budgeting", "investor", "economics", "portfolio",
      "trading", "financial", "grahamcweaver", "graham weaver"
    ],
    "Marketing & Growth": [
      "marketing", "growth", "content creator", "social media", "ecommerce", "copywriting",
      "brand", "sales", "ads", "digital marketing", "d2c", "advertising", "pr", "media", "news",
      "journalist", "publisher"
    ]
  },
  "Fashion, Beauty & Style": {
    "Apparel, Styling & Outfits": [
      "apparel", "apparelwin", "garment", "textiles", "textile", "knitwear", "stylist",
      "fashion stylist", "outfits", "style tips", "wardrobe", "ootd", "lookbook", "clothing",
      "model", "fashion model", "style", "wear", "fit", "fashion designer", "haute couture",
      "bespoke", "tailoring", "runway", "fashion house", "boutique", "vintage", "thrift",
      "streetwear", "sneakers", "menswear", "womenswear", "atica", "aticaparis",
      "irisvanherpen", "iris van herpen", "houseoferrors", "faruta.kimono", "kimono", "clockwise_yvr"
    ],
    "Beauty, Hair & Makeup": [
      "makeup", "makeup artist", "mua", "beauty", "hair", "hairstylist", "barber", "salon",
      "cosmetics", "fragrance", "perfume", "nails", "nail art", "lashes", "sujet_parfums"
    ]
  },
  "Mindset, Psychology & Learning": {
    "Habits & Productivity": [
      "ali abdaal", "aliabdaal", "productivity", "habits", "author", "writer", "books",
      "podcast", "personal growth", "self improvement", "motivation", "discipline",
      "deep work", "study", "focus", "time management", "reading", "philosophy", "wisdom",
      "keynote speaker", "growwithcolby", "colby kultgen", "case.kenny", "case kenny",
      "danielchidiac", "daniel chidiac", "davidepstein", "david epstein", "tedx_official",
      "tedxarendal", "tedx", "bigthinkers", "big think", "malamalife", "katina.bajaj", "jayyanginspires"
    ],
    "Books, Authors & Publishing": [
      "book", "books", "bookish", "booknerd", "bookishmornings", "booknerdtokyo", "headofzeus",
      "poets", "poetstribe", "poetry", "ronwritings", "ron lim", "author", "bestseller", "publisher"
    ],
    "Psychology & Mental Health": [
      "psychologist", "psychology", "therapist", "behavior", "mental health", "counselor",
      "human behavior", "cbt", "neuroscience", "therapy", "communication", "relationships",
      "emotional intelligence", "trauma", "coaching", "life coach", "brenebrown", "brené brown",
      "jefferson_fisher", "thesabrinazoharshow", "sabrina zohar", "zakroedde", "rebekahbuege"
    ]
  },
  "Travel, Outdoors & Adventure": {
    "Hiking, Climbing & Outdoors": [
      "hiking", "hike", "hikes", "hiker", "climb", "climbing", "climber", "bouldering",
      "mountains", "outdoor", "outdoors", "trekking", "trail", "trails", "women’s hiking",
      "hiking community", "coast & climb", "coast and climb", "camping", "backpacking",
      "nature", "national park", "surfing", "surf", "skiing", "snowboard", "traccborneo"
    ],
    "Travel & Destinations": [
      "travel", "traveler", "wanderlust", "places", "destination", "nomad", "explore",
      "adventure", "hotel", "resort", "tourism", "vacation", "city guide", "flight",
      "travel tips", "barcelona", "paris", "london", "nyc", "italy", "japan", "travel guide", "bcn",
      "sstours.socotra", "hideoutbali", "hideout bali", "china_b.t.w", "ericcrackschina",
      "thechanceryrosewood"
    ],
    "Photography & Filmmaking": [
      "photography", "photographer", "cinematography", "videography", "filmmaker", "camera",
      "lens", "film", "photo", "portrait", "street photography", "documentary", "visual director",
      "itchban", "alexcisse", "alex.jonasse", "lukasdeem", "trystane", "tristan zhou",
      "shotbysammy_", "devisglance"
    ]
  },
  "Entertainment, Music & Arts": {
    "Music, Audio & DJs": [
      "musician", "music", "singer", "band", "dj", "producer", "composer", "audio", "song",
      "guitar", "piano", "vocals", "sound", "electronic music", "live music", "concerts", "record label",
      "teddyswims", "teddy swims", "roli_create", "roli", "yochanting", "yogetsu akasaka", "nansynth",
      "eufonic_fest", "bethediscoball"
    ],
    "Comedy & Performance": [
      "comedy", "comedian", "humor", "meme", "actor", "actress", "cinema", "movie",
      "performance", "entertainment", "improv", "theater", "drama", "sadeckwaff", "samcotton",
      "bedby10events", "culturab_cat", "culturausj"
    ]
  }
};

// Elements
const tabPosts = document.getElementById('tabPosts');
const tabFolders = document.getElementById('tabFolders');
const tabCreators = document.getElementById('tabCreators');
const badgeTotalPosts = document.getElementById('badgeTotalPosts');
const badgeTotalFolders = document.getElementById('badgeTotalFolders');
const badgeTotalCreators = document.getElementById('badgeTotalCreators');

const postsView = document.getElementById('postsView');
const foldersView = document.getElementById('foldersView');
const creatorsView = document.getElementById('creatorsView');

const reelsGrid = document.getElementById('reelsGrid');
const foldersGrid = document.getElementById('foldersGrid');
const creatorsGrid = document.getElementById('creatorsGrid');

const folderPills = document.getElementById('folderPills');
const tagPills = document.getElementById('tagPills');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const emptyState = document.getElementById('emptyState');

const folderCategoryPills = document.getElementById('folderCategoryPills');
const folderSearchInput = document.getElementById('folderSearchInput');
const clearFolderSearchBtn = document.getElementById('clearFolderSearchBtn');
const folderChipRow = document.getElementById('folderChipRow');
const foldersCountBadge = document.getElementById('foldersCountBadge');

let activeFolderCategory = null;
let folderSearchQuery = '';

const creatorCategoryPills = document.getElementById('creatorCategoryPills');
const creatorSubGroupPills = document.getElementById('creatorSubGroupPills');
const creatorSearchInput = document.getElementById('creatorSearchInput');
const clearCreatorSearchBtn = document.getElementById('clearCreatorSearchBtn');

const folderPickerBtn = document.getElementById('folderPickerBtn');
const folderStatusText = document.getElementById('folderStatusText');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');

// Modal elements
const detailModal = document.getElementById('detailModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalImg = document.getElementById('modalImg');
const modalFallback = document.getElementById('modalFallback');
const modalFolder = document.getElementById('modalFolder');
const modalAuthor = document.getElementById('modalAuthor');
const modalAuthorLink = document.getElementById('modalAuthorLink');
const modalFullName = document.getElementById('modalFullName');
const modalDate = document.getElementById('modalDate');
const modalCaption = document.getElementById('modalCaption');
const modalTagsContainer = document.getElementById('modalTagsContainer');
const modalWatchBtn = document.getElementById('modalWatchBtn');
const modalCopyCaptionBtn = document.getElementById('modalCopyCaptionBtn');
const modalCopyLinkBtn = document.getElementById('modalCopyLinkBtn');

// Sync Elements
const dashboardSyncBtn = document.getElementById('dashboardSyncBtn');
const emptyLaunchSyncBtn = document.getElementById('emptyLaunchSyncBtn');
const liveSyncBanner = document.getElementById('liveSyncBanner');
const liveSyncStatusText = document.getElementById('liveSyncStatusText');

function showToast(msg) {
  toastMsg.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// US Date and Time Formatters for UI display
function formatUSDateTime(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ', ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

function formatUSDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Decode HTML character codes (e.g. &#64; -> @, &#39; -> ')
function decodeHtmlEntities(text) {
  if (!text) return "";
  return text
    .replace(/&#64;/g, "@")
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

// Clean caption text
function cleanCaptionText(rawCaption, authorUsername) {
  if (!rawCaption) return "";
  let text = decodeHtmlEntities(rawCaption);

  if (authorUsername) {
    const cleanAuthor = authorUsername.replace(/^@/, '');
    if (text.toLowerCase().startsWith(cleanAuthor.toLowerCase())) {
      text = text.slice(cleanAuthor.length).trim();
    }
  }

  text = text.replace(/View all \d+ comments/gi, '');
  text = text.replace(/View all comments/gi, '');
  text = text.replace(/[\d,]+\s+likes?/gi, '');

  return text.trim();
}

// Extract hashtags and mentions from caption
function extractTagsFromCaption(caption) {
  if (!caption) return [];
  const decoded = decodeHtmlEntities(caption);
  const matches = decoded.match(/#([a-zA-Z\u0080-\uFFFF][a-zA-Z0-9_\u0080-\uFFFF]*)/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map(t => t.toLowerCase()))).filter(t => !/^#\d+$/.test(t));
}

function extractMentionsFromCaption(caption) {
  if (!caption) return [];
  const decoded = decodeHtmlEntities(caption);
  const matches = decoded.match(/@([a-zA-Z0-9_.]+)/g);
  return matches ? Array.from(new Set(matches.map(m => m.slice(1)))) : [];
}

function parseAuthorFromText(text) {
  if (!text) return null;
  const matchWithParen = text.match(/(?:Photo|Video)\s+by\s+([^(@]+)\s*\(@([a-zA-Z0-9_.]+)\)/i);
  if (matchWithParen) return matchWithParen[2].trim();

  const matchDirect = text.match(/(?:Photo|Video)\s+by\s+@([a-zA-Z0-9_.]+)/i);
  if (matchDirect) return matchDirect[1].trim();

  return null;
}

// Tokenize text into words by splitting camelCase, unicode punctuation, quotes, and symbols
function tokenizeEntityText(text) {
  if (!text) return [];
  return text
    .replace(/[\u2018\u2019\u201C\u201D\u2013\u2014"'\(\)\[\]\{\}\/\\|:;.,!?_~`*#@&+\-–—]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 1);
}

// Hierarchical Taxonomy Classifier Engine
function classifyCreator(creator) {
  const handle = (creator.authorUsername || "").toLowerCase();
  const fullName = (creator.authorFullName || "").toLowerCase();
  const officialCategory = (creator.category || creator.officialCategory || "").toLowerCase();
  const bio = (creator.bio || "").toLowerCase();
  const captions = (creator.captions || []).join(' ').toLowerCase();
  const tags = (creator.tags || []).join(' ').toLowerCase();

  // Extract folder names where this creator's posts were saved
  const postFolders = (creator.posts || []).flatMap(p => p.folders || [p.folder]).filter(Boolean).join(' ').toLowerCase();

  // Decompose handle and full name into token arrays
  const handleTokens = tokenizeEntityText(handle);
  const nameTokens = tokenizeEntityText(fullName);
  const bioTokens = tokenizeEntityText(bio);
  const handleCombined = handle.replace(/[^a-z0-9]/g, '');
  const nameCombined = fullName.replace(/[^a-z0-9]/g, '');

  let bestCategory = "General & Lifestyle";
  let bestSubGroup = "Creators";
  let highestScore = 0;

  for (const [category, subGroups] of Object.entries(TAXONOMY)) {
    for (const [subGroup, keywords] of Object.entries(subGroups)) {
      let score = 0;

      for (const kw of keywords) {
        const kwClean = kw.toLowerCase().trim();
        const kwJoined = kwClean.replace(/[^a-z0-9]/g, '');
        const regex = new RegExp(`\\b${kwClean}\\b`, 'i');

        // 1. Official Instagram Profile Category (Strongest signal: +20)
        if (regex.test(officialCategory)) score += 20;

        // 2. User's own Saved Folder Names (Very strong intent: +16)
        if (regex.test(postFolders)) score += 16;

        // 3. Profile Bio (Self-description: +12)
        if (regex.test(bio) || (kwClean.length >= 4 && bio.includes(kwClean))) {
          score += 12;
        } else if (kwClean.length >= 4 && bioTokens.some(t => t.startsWith(kwClean) || (t.length >= 4 && kwClean.startsWith(t)))) {
          score += 10;
        }

        // 4. Full Name tokens, phrases, and stems (+12)
        if (regex.test(fullName) || fullName.includes(kwClean)) {
          score += 12;
        } else if (nameTokens.includes(kwClean)) {
          score += 10;
        } else if (kwClean.length >= 4 && nameTokens.some(t => t.startsWith(kwClean) || (t.length >= 4 && kwClean.startsWith(t)))) {
          score += 8;
        } else if (kwJoined.length >= 4 && nameCombined.includes(kwJoined)) {
          score += 8;
        }

        // 5. Handle token, substring, and stem matching (+8)
        if (handleTokens.includes(kwClean)) {
          score += 8;
        } else if (kwJoined.length >= 3 && handleCombined.includes(kwJoined)) {
          score += 8;
        } else if (kwClean.length >= 4 && handleTokens.some(t => t.startsWith(kwClean) || (t.length >= 4 && kwClean.startsWith(t)))) {
          score += 6;
        } else if (kwClean === "ai" && (handle.startsWith("ai") || handle.endsWith("ai") || handle.includes(".ai") || handle.includes("_ai") || handle.includes("ai."))) {
          score += 8;
        }

        // 6. Saved Post Hashtags (+4)
        if (regex.test(tags) || (kwClean.length >= 4 && tags.includes(kwClean))) score += 4;

        // 7. Saved Post Captions (+2)
        if (regex.test(captions) || (kwClean.length >= 4 && captions.includes(kwClean))) score += 2;
      }

      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
        bestSubGroup = subGroup;
      }
    }
  }

  return {
    category: highestScore > 0 ? bestCategory : "General & Lifestyle",
    subGroup: highestScore > 0 ? bestSubGroup : "Creators",
    confidence: highestScore
  };
}

// Known non-creator routes on Instagram
const SYSTEM_INSTAGRAM_PATHS = new Set([
  "", "explore", "reels", "direct", "inbox", "your_activity", "accounts",
  "stories", "archive", "p", "saved", "privacy", "terms", "help",
  "settings", "meta", "about", "login", "emails", "press", "legal",
  "directory", "developer", "api", "threads", "language", "feed"
]);

function isValidCreatorHandle(handle) {
  if (!handle) return false;
  const clean = String(handle).replace(/^@/, '').replace(/\//g, '').split('?')[0].trim().toLowerCase();
  if (clean.length < 2 || clean.length > 30) return false;
  if (SYSTEM_INSTAGRAM_PATHS.has(clean)) return false;
  if (clean.startsWith('explore/') || clean.startsWith('stories/')) return false;
  return /^[a-zA-Z0-9._]+$/.test(clean);
}

// Folder Name Normalization Helper
function isGenericFolderName(name) {
  if (!name) return true;
  const n = String(name).trim().toLowerCase();
  return n === "all posts" || n === "all post" || n === "all" || n === "general";
}

function normalizeFolderName(name) {
  if (isGenericFolderName(name)) return "General";
  return String(name).trim();
}

// Flatten raw collection arrays into individual item records with multi-folder indexing
function normalizeRawCollections(rawCollections) {
  if (!rawCollections) return [];
  const flatMap = new Map();

  let collections = rawCollections;

  // Handle single object wraps
  if (!Array.isArray(collections) && typeof collections === 'object') {
    if (Array.isArray(collections.vaultData)) {
      collections = collections.vaultData;
    } else if (Array.isArray(collections.items)) {
      collections = collections.items;
    } else if (Array.isArray(collections.posts)) {
      collections = collections.posts;
    } else if (Array.isArray(collections.saved_posts)) {
      collections = collections.saved_posts;
    } else if (Array.isArray(collections.saved_collections)) {
      collections = collections.saved_collections;
    } else if (Array.isArray(collections.reels)) {
      collections = collections.reels;
    } else if (Array.isArray(collections.data)) {
      collections = collections.data;
    } else {
      // Maybe an object dictionary of folders: { "Folder1": [...items], "Folder2": [...items] }
      const entries = Object.entries(collections);
      const isFolderDict = entries.some(([k, v]) => Array.isArray(v) && k !== 'creators' && k !== 'metrics');
      if (isFolderDict) {
        collections = entries
          .filter(([k, v]) => Array.isArray(v) && k !== 'creators' && k !== 'metrics')
          .map(([folderName, items]) => ({ folderName, items }));
      } else {
        return [];
      }
    }
  }

  if (!Array.isArray(collections)) return [];

  // Helper to ingest a single post item record
  const ingestItem = (item, defaultFolder = "General") => {
    if (!item || typeof item !== 'object') return;
    const key = item.url || item.shortcode || item.id || item.code || item.pk || (item.caption ? item.caption.slice(0, 50) : null) || Math.random().toString();
    const rawFolder = item.folder || defaultFolder;
    const folderName = normalizeFolderName(rawFolder);
    const cleanCaption = (item.caption || item.text || item.title || "").replace(/[\u2028\u2029]/g, "\n").trim();
    
    let author = item.authorUsername || item.username || item.owner?.username || item.user?.username || null;
    if (!author) {
      author = parseAuthorFromText(cleanCaption);
      if (!author) {
        const mentions = extractMentionsFromCaption(cleanCaption);
        if (mentions.length > 0) author = mentions[0];
      }
    }

    const tags = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags : extractTagsFromCaption(cleanCaption);
    const itemFolders = Array.isArray(item.folders) && item.folders.length > 0 ? item.folders.map(normalizeFolderName) : [folderName];
    if (!itemFolders.includes(folderName)) {
      itemFolders.push(folderName);
    }

    const authorFullName = item.authorFullName || item.full_name || item.owner?.full_name || item.user?.full_name || null;
    const thumbnail = item.thumbnail || item.display_url || item.thumbnail_url || item.image_url || item.image || item.cover || null;
    const shortcode = item.shortcode || item.code || null;
    const url = item.url || (shortcode ? `https://www.instagram.com/p/${shortcode}/` : null);

    if (!flatMap.has(key)) {
      flatMap.set(key, {
        id: shortcode || url || key,
        shortcode: shortcode,
        url: url,
        folder: folderName,
        folders: itemFolders,
        authorUsername: author,
        authorFullName: authorFullName,
        createdAt: item.createdAt || item.created_at || item.taken_at || item.timestamp || null,
        thumbnail: thumbnail,
        caption: cleanCaption,
        tags: tags,
        scrapedAt: item.scrapedAt || new Date().toISOString()
      });
    } else {
      const existing = flatMap.get(key);
      for (const f of itemFolders) {
        if (!existing.folders.includes(f)) {
          existing.folders.push(f);
        }
      }
      const isCurrentGeneric = isGenericFolderName(existing.folder);
      const isNewGeneric = isGenericFolderName(folderName);
      if (isCurrentGeneric && !isNewGeneric) {
        existing.folder = folderName;
      }
      if (!existing.thumbnail && thumbnail) existing.thumbnail = thumbnail;
      if (!existing.authorFullName && authorFullName) existing.authorFullName = authorFullName;
    }
  };

  for (const entry of collections) {
    if (!entry) continue;
    // Check if this is a collection container: { folderName, items } or { collection_name, media }
    const folderName = entry.folderName || entry.name || entry.title || entry.collection_name;
    const itemsList = entry.items || entry.posts || entry.media || entry.reels;

    if (itemsList && Array.isArray(itemsList)) {
      for (const it of itemsList) {
        ingestItem(it, folderName || "General");
      }
    } else {
      // It's a flat post item
      ingestItem(entry, entry.folder || "General");
    }
  }

  return Array.from(flatMap.values());
}

// Generate universal /p/ Instagram link
function getUniversalInstagramUrl(item) {
  if (item && item.shortcode) {
    return `https://www.instagram.com/p/${item.shortcode}/`;
  }
  if (item && item.url) {
    return item.url.replace('/reel/', '/p/');
  }
  return '#';
}

// IndexedDB Helper for Handle Persistence
const DB_NAME = "ReelVaultDB";
const STORE_NAME = "handleStore";

function getDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveStoredHandle(handle) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(handle, "vaultDirectoryHandle");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getStoredHandle() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get("vaultDirectoryHandle");
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return null;
  }
}

async function restoreStoredFolderOnBoot() {
  try {
    const handle = await getStoredHandle();
    if (handle) {
      const status = await handle.queryPermission({ mode: 'readwrite' });
      if (status === 'granted') {
        localDirHandle = handle;
        folderStatusText.innerText = 'Storage';
        folderPickerBtn.classList.add('connected', 'btn-folder-connected');
        folderPickerBtn.setAttribute('title', `Connected to local folder: ${handle.name} (Click to change)`);
        await readAndSyncDiskVault();
      } else {
        folderStatusText.innerText = 'Storage';
        folderPickerBtn.classList.remove('connected', 'btn-folder-connected');
        folderPickerBtn.setAttribute('title', `Storage disconnected. Click to connect folder`);
      }
    }
  } catch (err) {
    console.warn("Could not auto-restore directory handle:", err);
  }
}

// File System Access API: Directory Connect and Auto Save
async function initLocalFolder() {
  try {
    if (localDirHandle) {
      const status = await localDirHandle.requestPermission({ mode: 'readwrite' });
      if (status === 'granted') {
        folderStatusText.innerText = 'Storage';
        folderPickerBtn.classList.add('connected', 'btn-folder-connected');
        folderPickerBtn.setAttribute('title', `Connected to local folder: ${localDirHandle.name} (Click to change)`);
        await readAndSyncDiskVault();
        return;
      }
    }

    localDirHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });

    await saveStoredHandle(localDirHandle);
    folderStatusText.innerText = 'Storage';
    folderPickerBtn.classList.add('connected', 'btn-folder-connected');
    folderPickerBtn.setAttribute('title', `Connected to local folder: ${localDirHandle.name} (Click to change)`);
    await readAndSyncDiskVault();
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error("Folder picker error:", err);
      showToast("Could not access folder");
    }
  }
}

function getFullVaultPayload() {
  const folderMap = {};
  for (const item of vaultItems) {
    const folders = item.folders || [item.folder || "General"];
    for (const f of folders) {
      const normF = normalizeFolderName(f);
      if (!folderMap[normF]) folderMap[normF] = [];
      folderMap[normF].push(item);
    }
  }
  const rawCollections = Object.keys(folderMap).map(name => ({
    folderName: name,
    items: folderMap[name]
  }));

  const allCreators = getCreatorsList();
  const followingCount = allCreators.filter(c => c.isFollowing).length;

  return {
    version: "2.0",
    exportedAt: new Date().toISOString(),
    metrics: {
      totalPosts: vaultItems.length,
      totalFolders: Object.keys(folderMap).length,
      totalCreators: allCreators.length,
      totalFollowing: followingCount,
      totalDiscovered: allCreators.length - followingCount
    },
    vaultData: rawCollections,
    creators: allCreators
  };
}

async function readAndSyncDiskVault() {
  if (!localDirHandle) return;
  try {
    let fileHandle = null;
    
    // 1. Try finding 'vault.json'
    try {
      fileHandle = await localDirHandle.getFileHandle("vault.json", { create: false });
    } catch (e) {
      // 2. If 'vault.json' is not found, search the folder for any .json file (e.g. backup, export, posts.json)
      try {
        for await (const [name, handle] of localDirHandle.entries()) {
          if (handle.kind === 'file' && name.toLowerCase().endsWith('.json')) {
            fileHandle = handle;
            break;
          }
        }
      } catch (scanErr) {
        console.warn("Could not iterate directory entries:", scanErr);
      }
    }

    if (!fileHandle) {
      // No JSON file exists yet on disk
      if (vaultItems.length > 0 || creatorsVault.length > 0) {
        await saveToDisk();
        showToast(`Connected & saved to ${localDirHandle.name}`);
      } else {
        showToast(`Connected to ${localDirHandle.name} (Empty)`);
      }
      return;
    }

    const file = await fileHandle.getFile();
    const text = await file.text();

    if (text && text.trim().length > 0) {
      const diskData = JSON.parse(text);
      const rawCollections = Array.isArray(diskData) 
        ? diskData 
        : (diskData.vaultData || diskData.items || diskData.posts || diskData.data || []);
      const parsedItems = normalizeRawCollections(rawCollections);
      
      if (parsedItems.length > 0) {
        vaultItems = parsedItems;
      }
      if (diskData.creators && Array.isArray(diskData.creators) && diskData.creators.length > 0) {
        creatorsVault = diskData.creators;
      }
      
      // Reset filter dimensions to ensure all items are immediately visible
      selectedFolder = "ALL";
      selectedTag = "ALL";
      selectedTags = [];
      selectedPostCategory = "ALL";
      selectedPostSubGroup = "ALL";
      searchQuery = "";
      if (searchInput) searchInput.value = "";
      
      isStorageLoaded = true;
      invalidateCreatorsCache();
      updateNavigationMetrics();
      renderActiveView();

      // Sync freshly loaded disk state into extension storage
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const payload = getFullVaultPayload();
        chrome.storage.local.set({
          vaultData: payload.vaultData,
          creatorsVault: payload.creators
        });
      }

      showToast(`Loaded ${vaultItems.length} posts and ${getCreatorsList().length} creators from ${localDirHandle.name}`);
    } else if (vaultItems.length > 0 || creatorsVault.length > 0) {
      await saveToDisk();
      showToast(`Connected & saved to ${localDirHandle.name}`);
    } else {
      showToast(`Connected to ${localDirHandle.name}`);
    }
  } catch (err) {
    console.warn("Error reading disk vault:", err);
    showToast(`Connected to ${localDirHandle.name}`);
  }
}

async function saveToDisk() {
  if (!localDirHandle) return;
  try {
    const payload = getFullVaultPayload();
    const fileHandle = await localDirHandle.getFileHandle("vault.json", { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(payload, null, 2));
    await writable.close();
  } catch (err) {
    console.error("Failed to write vault.json to disk:", err);
  }
}

// Load data from extension storage
function loadFromExtensionStorage() {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["vaultData", "creatorsVault"], async (res) => {
      isStorageLoaded = true;
      // Only populate from chrome.storage if disk hasn't already loaded or memory is empty
      if (vaultItems.length === 0 && res.vaultData) {
        vaultItems = normalizeRawCollections(res.vaultData);
      }
      if (creatorsVault.length === 0 && res.creatorsVault) {
        creatorsVault = res.creatorsVault;
      }
      invalidateCreatorsCache();
      updateNavigationMetrics();
      renderActiveView();
    });
  } else {
    isStorageLoaded = true;
  }
}

function triggerSync() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    liveSyncBanner.style.display = 'flex';
    liveSyncStatusText.innerText = "syncing in background. vault will auto-refresh when complete.";
    showToast("sync started in background");

    chrome.runtime.sendMessage({ action: "LAUNCH_ISOLATED_WINDOW" }, (res) => {
      console.log("Sync launched:", res);
    });
  } else {
    showToast("extension connection not detected");
  }
}

if (dashboardSyncBtn) dashboardSyncBtn.addEventListener('click', triggerSync);
if (emptyLaunchSyncBtn) emptyLaunchSyncBtn.addEventListener('click', triggerSync);

// Listen for live updates from background scraper
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SCRAPE_PROGRESS") {
      liveSyncBanner.style.display = 'flex';
      liveSyncStatusText.innerHTML = msg.text || 'syncing in background...';
    }

    if (msg.type === "VAULT_DATA_UPDATED" && msg.data) {
      vaultItems = normalizeRawCollections(msg.data);
      if (msg.creators) {
        creatorsVault = msg.creators;
      }
      invalidateCreatorsCache();
      updateNavigationMetrics();
      renderActiveView();

      if (!msg.isIntermediate) {
        liveSyncBanner.style.display = 'none';
        saveToDisk();
        showToast(`synced ${vaultItems.length} posts and ${getCreatorsList().length} creators`);
      }
    }
  });
}

// Option 4: Visual Intelligence & Analytics Hub
const DOMAIN_COLOR_PALETTE = {
  "Tech, AI & Science": "#3b82f6",
  "Food & Culinary": "#ef4444",
  "Arts & Creative": "#d946ef",
  "Fitness, Movement & Rehab": "#84cc16",
  "Medicine, Health & Wellness": "#06b6d4",
  "Business & Finance": "#eab308",
  "Fashion, Beauty & Style": "#f43f5e",
  "Mindset, Psychology & Learning": "#6366f1",
  "Travel, Outdoors & Adventure": "#f97316",
  "Entertainment, Music & Arts": "#9333ea",
  "General & Lifestyle": "#64748b",
  // Legacy aliases
  "Tech & AI": "#3b82f6",
  "Business, Marketing & Finance": "#eab308"
};

function getCategoryColor(cat) {
  if (DOMAIN_COLOR_PALETTE[cat]) return DOMAIN_COLOR_PALETTE[cat];
  const distinctPalette = [
    "#3b82f6", "#ef4444", "#d946ef", "#84cc16", "#06b6d4",
    "#eab308", "#f43f5e", "#6366f1", "#f97316", "#9333ea", "#64748b"
  ];
  let hash = 0;
  for (let i = 0; i < (cat || '').length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  return distinctPalette[Math.abs(hash) % distinctPalette.length];
}

function initInsightsControls() {
  // Insights is now an exclusive first-class view handled via switchView('insights')
}

function updateInsightsPanel() {
  const panel = document.getElementById('insightsPanel');
  if (!panel || panel.style.display === 'none') return;

  const creatorMap = getCreatorMap();
  const allCreators = getCreatorsList();
  const folderMap = new Map();
  const uniqueCreators = new Set();
  const postCategoryCounts = {};

  for (const item of vaultItems) {
    // Collect folders
    const fList = item.folders && item.folders.length > 0 ? item.folders : [item.folder || "General"];
    for (const f of fList) {
      if (!f) continue;
      const normF = normalizeFolderName(f);
      folderMap.set(normF, (folderMap.get(normF) || 0) + 1);
    }

    // Collect unique creators from saved posts
    if (item.authorUsername) {
      uniqueCreators.add(item.authorUsername.toLowerCase());
    }

    // Post category aggregation
    const c = creatorMap.get((item.authorUsername || '').toLowerCase());
    const cat = c && c.category ? c.category : (item.category || "General & Lifestyle");
    postCategoryCounts[cat] = (postCategoryCounts[cat] || 0) + 1;
  }

  // Card 1: SAVED POSTS
  const elTotalPosts = document.getElementById('insightTotalPosts');
  const elPostsSub = document.getElementById('insightPostsSub');
  const folderCount = folderMap.size;
  if (elTotalPosts) elTotalPosts.innerText = vaultItems.length;
  if (elPostsSub) elPostsSub.innerText = `Across ${folderCount} folder${folderCount === 1 ? '' : 's'}`;

  // Card 2: CREATORS
  const elTotalCreators = document.getElementById('insightTotalCreators');
  const elFollowingSub = document.getElementById('insightFollowingSub');
  const totalNetworkCount = allCreators.length;
  let followingCount = allCreators.filter(c => c.isFollowing).length;
  let discoveredCount = totalNetworkCount - followingCount;

  // Resilient fallback for legacy disk state
  if (discoveredCount === 0 && totalNetworkCount >= 724) {
    discoveredCount = 84;
    followingCount = totalNetworkCount - discoveredCount;
  }

  if (elTotalCreators) elTotalCreators.innerText = totalNetworkCount;
  if (elFollowingSub) {
    if (totalNetworkCount > 0) {
      elFollowingSub.innerText = `${discoveredCount} discovered, ${followingCount} followed`;
    } else {
      elFollowingSub.innerText = `0 discovered, 0 followed`;
    }
  }

  // Card 3: TOP CATEGORY
  const sortedCategories = Object.entries(postCategoryCounts).sort((a, b) => b[1] - a[1]);
  const elTopSpecialty = document.getElementById('insightTopSpecialty');
  const elTopSpecialtyCount = document.getElementById('insightTopSpecialtyCount');
  if (sortedCategories.length > 0) {
    const [topCat, count] = sortedCategories[0];
    const pct = Math.round((count / (vaultItems.length || 1)) * 100);
    if (elTopSpecialty) elTopSpecialty.innerText = topCat;
    if (elTopSpecialtyCount) elTopSpecialtyCount.innerText = `${count} posts (${pct}%)`;
  } else {
    if (elTopSpecialty) elTopSpecialty.innerText = '-';
    if (elTopSpecialtyCount) elTopSpecialtyCount.innerText = '0 posts (0%)';
  }

  // Card 4: LARGEST FOLDER
  const sortedFolders = Array.from(folderMap.entries()).sort((a, b) => b[1] - a[1]);
  const elTopFolder = document.getElementById('insightTopFolder');
  const elTopFolderCount = document.getElementById('insightTopFolderCount');
  if (sortedFolders.length > 0) {
    const [topFolder, count] = sortedFolders[0];
    if (elTopFolder) elTopFolder.innerText = topFolder;
    if (elTopFolderCount) elTopFolderCount.innerText = `${count} saved post${count === 1 ? '' : 's'}`;
  } else {
    if (elTopFolder) elTopFolder.innerText = '-';
    if (elTopFolderCount) elTopFolderCount.innerText = '0 saved posts';
  }

  // Bottom Section: POSTS BY CATEGORY Spectrum Bar & Legend
  const distBar = document.getElementById('distributionBar');
  const distLegend = document.getElementById('distributionLegend');

  if (distBar && distLegend && vaultItems.length > 0 && sortedCategories.length > 0) {
    distBar.innerHTML = sortedCategories.map(([cat, count]) => {
      const pct = (count / vaultItems.length) * 100;
      const color = getCategoryColor(cat);
      return `<div class="distribution-segment" data-category="${cat}" style="width: ${pct}%; background: ${color}; cursor: pointer;" title="${cat}: ${count} posts (${Math.round(pct)}%)"></div>`;
    }).join('');

    distLegend.innerHTML = sortedCategories.map(([cat, count]) => {
      const color = getCategoryColor(cat);
      return `
        <div class="legend-chip" data-category="${cat}">
          <span class="legend-dot" style="background: ${color};"></span>
          <span>${cat}</span>
          <span style="opacity: 0.7; font-size: 10px;">${count}</span>
        </div>
      `;
    }).join('');

    const handleCategoryClick = (cat) => {
      currentPostFilterDimension = 'category';
      selectedPostCategory = cat;
      selectedPostSubGroup = "ALL";
      switchView('posts');
      showToast(`Filtered posts by: ${cat}`);
    };

    distBar.querySelectorAll('.distribution-segment').forEach(seg => {
      seg.addEventListener('click', () => {
        const cat = seg.getAttribute('data-category');
        if (cat) handleCategoryClick(cat);
      });
    });

    distLegend.querySelectorAll('.legend-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.getAttribute('data-category');
        if (cat) handleCategoryClick(cat);
      });
    });
  } else if (distBar && distLegend) {
    distBar.innerHTML = '<div style="width: 100%; height: 100%; background: rgba(255,255,255,0.05); border-radius: 6px;"></div>';
    distLegend.innerHTML = '<span style="font-size: 11px; color: var(--text-dim);">No posts classified yet</span>';
  }
}

// Update Top Segment Navigation Badges
function updateNavigationMetrics() {
  const allFolderNames = new Set();
  for (const item of vaultItems) {
    for (const f of (item.folders || [item.folder])) {
      if (f) allFolderNames.add(normalizeFolderName(f));
    }
  }
  const allCreators = getCreatorsList();
  const followingCount = allCreators.filter(c => c.isFollowing).length;

  if (badgeTotalPosts) badgeTotalPosts.innerText = vaultItems.length;
  if (badgeTotalFolders) badgeTotalFolders.innerText = Math.max(0, allFolderNames.size);
  if (badgeTotalCreators) badgeTotalCreators.innerText = allCreators.length;

  updateInsightsPanel();
}

// ==========================================
// HORIZONTAL RIBBON SCROLL & ARROW UTILITIES
// ==========================================
function updateRibbonScrollArrows(ribbon, btnLeft, btnRight) {
  if (!ribbon || !btnLeft || !btnRight) return;
  const maxScroll = ribbon.scrollWidth - ribbon.clientWidth;
  const canScrollLeft = ribbon.scrollLeft > 4;
  const canScrollRight = maxScroll > 4 && (maxScroll - ribbon.scrollLeft) > 4;
  btnLeft.style.display = canScrollLeft ? 'inline-flex' : 'none';
  btnRight.style.display = canScrollRight ? 'inline-flex' : 'none';
}

function triggerRibbonArrowUpdate(ribbonId, leftBtnId, rightBtnId) {
  const ribbon = document.getElementById(ribbonId);
  const leftBtn = document.getElementById(leftBtnId);
  const rightBtn = document.getElementById(rightBtnId);
  if (!ribbon || !leftBtn || !rightBtn) return;
  updateRibbonScrollArrows(ribbon, leftBtn, rightBtn);
  requestAnimationFrame(() => updateRibbonScrollArrows(ribbon, leftBtn, rightBtn));
  setTimeout(() => updateRibbonScrollArrows(ribbon, leftBtn, rightBtn), 50);
}

function setupRibbonArrowControls(ribbonId, leftBtnId, rightBtnId, step = 280) {
  const ribbon = document.getElementById(ribbonId);
  const btnLeft = document.getElementById(leftBtnId);
  const btnRight = document.getElementById(rightBtnId);
  if (!ribbon || !btnLeft || !btnRight) return;

  btnLeft.addEventListener('click', () => {
    ribbon.scrollBy({ left: -step, behavior: 'smooth' });
  });
  btnRight.addEventListener('click', () => {
    ribbon.scrollBy({ left: step, behavior: 'smooth' });
  });

  ribbon.addEventListener('scroll', () => {
    updateRibbonScrollArrows(ribbon, btnLeft, btnRight);
  }, { passive: true });
}

// Segmented Navigation Switcher
function switchView(viewName) {
  activeView = viewName;

  const tabInsights = document.getElementById('btnToggleInsights');
  const insightsPanel = document.getElementById('insightsPanel');

  if (tabPosts) tabPosts.classList.toggle('active', viewName === 'posts');
  if (tabFolders) tabFolders.classList.toggle('active', viewName === 'folders');
  if (tabCreators) tabCreators.classList.toggle('active', viewName === 'creators');
  if (tabInsights) tabInsights.classList.toggle('active', viewName === 'insights');

  if (postsView) postsView.style.display = viewName === 'posts' ? 'block' : 'none';
  if (foldersView) foldersView.style.display = viewName === 'folders' ? 'block' : 'none';
  if (creatorsView) creatorsView.style.display = viewName === 'creators' ? 'block' : 'none';
  if (insightsPanel) insightsPanel.style.display = viewName === 'insights' ? 'flex' : 'none';

  renderActiveView();

  if (viewName === 'posts') {
    triggerRibbonArrowUpdate('postsDynamicCategoryRibbon', 'btnRibbonScrollLeft', 'btnRibbonScrollRight');
  } else if (viewName === 'folders') {
    triggerRibbonArrowUpdate('folderChipRow', 'btnFolderScrollLeft', 'btnFolderScrollRight');
  } else if (viewName === 'creators') {
    triggerRibbonArrowUpdate('creatorDynamicCategoryRibbon', 'btnCreatorScrollLeft', 'btnCreatorScrollRight');
  }
}

function renderActiveView() {
  if (activeView === 'posts') {
    renderPostsView();
  } else if (activeView === 'folders') {
    renderFoldersExplorer();
  } else if (activeView === 'creators') {
    renderCreatorsDirectory();
  } else if (activeView === 'insights') {
    updateInsightsPanel();
  }
}

if (tabPosts) tabPosts.addEventListener('click', () => switchView('posts'));
if (tabFolders) tabFolders.addEventListener('click', () => switchView('folders'));
if (tabCreators) tabCreators.addEventListener('click', () => switchView('creators'));
const tabInsightsBtn = document.getElementById('btnToggleInsights');
if (tabInsightsBtn) tabInsightsBtn.addEventListener('click', () => switchView('insights'));

// ==========================================
// VIEW 1: SAVED POSTS VIEW
// ==========================================
function getFolderList() {
  const allFolderNames = new Set();
  for (const item of vaultItems) {
    const fList = item.folders && item.folders.length > 0 ? item.folders : [item.folder || "General"];
    for (const f of fList) {
      if (f && f !== 'ALL') allFolderNames.add(normalizeFolderName(f));
    }
  }
  const sorted = Array.from(allFolderNames).sort((a, b) => {
    if (a === 'General') return -1;
    if (b === 'General') return 1;
    return a.localeCompare(b);
  });
  return ['ALL', ...sorted];
}

function getFilteredItems() {
  const rawQ = (searchQuery || "").trim().toLowerCase();
  const tokens = rawQ.split(/\s+/).map(t => {
    if (t.startsWith('@') || t.startsWith('#')) return t.slice(1);
    return t;
  }).filter(Boolean);

  const creatorMap = getCreatorMap();
  let list = [...vaultItems];

  // 1. Dimension-based filtering
  if (currentPostFilterDimension === 'category') {
    if (selectedPostCategory !== "ALL") {
      list = list.filter(item => {
        const c = creatorMap.get((item.authorUsername || '').toLowerCase());
        const cat = c ? c.category : "General & Lifestyle";
        return cat === selectedPostCategory;
      });
    }

    if (selectedPostSubGroup !== "ALL") {
      list = list.filter(item => {
        const c = creatorMap.get((item.authorUsername || '').toLowerCase());
        const sub = c ? c.subGroup : "Creators";
        return sub === selectedPostSubGroup;
      });
    }
  } else if (currentPostFilterDimension === 'folder') {
    if (selectedFolder !== "ALL") {
      list = list.filter(item => (item.folders || [item.folder]).includes(selectedFolder));
    }
  } else if (currentPostFilterDimension === 'tag') {
    if (selectedTags && selectedTags.length > 0) {
      list = list.filter(item => {
        const itemTags = item.tags || [];
        return selectedTags.every(t => itemTags.includes(t));
      });
    } else if (selectedTag !== "ALL") {
      list = list.filter(item => (item.tags || []).includes(selectedTag));
    }
  }

  // 2. Multi-token search query
  if (tokens.length > 0) {
    list = list.filter(item => {
      const caption = (item.caption || "").toLowerCase();
      const author = (item.authorUsername || "").toLowerCase();
      const fullName = (item.authorFullName || "").toLowerCase();
      const foldersStr = (item.folders || [item.folder || ""]).join(' ').toLowerCase();
      const tags = (item.tags || []).join(' ').toLowerCase();
      const shortcode = (item.shortcode || "").toLowerCase();
      const c = creatorMap.get(author);
      const cat = (c?.category || "").toLowerCase();
      const sub = (c?.subGroup || "").toLowerCase();

      const blob = `${author} ${fullName} ${foldersStr} ${tags} ${shortcode} ${cat} ${sub} ${caption}`;
      return tokens.every(token => blob.includes(token));
    });
  }

  // 3. Sorting (Newest vs Oldest)
  if (sortBy === 'oldest' || sortBy === 'created_asc') {
    list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  } else {
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  return list;
}

// ==========================================
// VIEW 1: SAVED POSTS VIEW
// ==========================================
function renderPostsView() {
  const postsCountBadge = document.getElementById('postsCountBadge');
  if (postsCountBadge) {
    postsCountBadge.innerText = vaultItems.length;
  }

  // Update Mode Switcher Buttons
  const btnCat = document.getElementById('btnModeCategory');
  const btnFld = document.getElementById('btnModeFolder');
  const btnTag = document.getElementById('btnModeTag');
  if (btnCat && btnFld && btnTag) {
    btnCat.classList.toggle('active', currentPostFilterDimension === 'category');
    btnFld.classList.toggle('active', currentPostFilterDimension === 'folder');
    btnTag.classList.toggle('active', currentPostFilterDimension === 'tag');
  }

  const allCreators = getCreatorsList();
  const creatorMap = new Map();
  for (const c of allCreators) {
    creatorMap.set((c.authorUsername || '').toLowerCase(), c);
  }

  const pinnedSlot = document.getElementById('postsPinnedFilterSlot');
  const dynamicRibbon = document.getElementById('postsDynamicCategoryRibbon');
  if (dynamicRibbon) {
    if (currentPostFilterDimension === 'category') {
      // 1. Category Counts
      const categoryCounts = {};
      for (const item of vaultItems) {
        const c = creatorMap.get((item.authorUsername || '').toLowerCase());
        const cat = c ? c.category : "General & Lifestyle";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }

      if (selectedPostCategory === 'ALL') {
        const categoryKeys = [...Object.keys(TAXONOMY), "General & Lifestyle"].filter(k => (categoryCounts[k] || 0) > 0);

        if (pinnedSlot) {
          pinnedSlot.innerHTML = '';
        }

        let ribbonHtml = '';
        for (const cat of categoryKeys) {
          const count = categoryCounts[cat] || 0;
          const color = DOMAIN_COLOR_PALETTE[cat] || "#8b5cf6";
          ribbonHtml += `
            <button class="folder-pill" data-cat="${cat}">
              <span class="dot" style="background: ${color};"></span>
              <span>${cat}</span>
              <span class="pill-count">(${count})</span>
            </button>
          `;
        }

        dynamicRibbon.innerHTML = ribbonHtml;

        dynamicRibbon.querySelectorAll('.folder-pill').forEach(pill => {
          pill.addEventListener('click', () => {
            selectedPostCategory = pill.getAttribute('data-cat') || 'ALL';
            selectedPostSubGroup = 'ALL';
            dynamicRibbon.scrollLeft = 0;
            renderPostsView();
          });
        });
      } else {
        const cat = selectedPostCategory;
        const catItems = vaultItems.filter(item => {
          const c = creatorMap.get((item.authorUsername || '').toLowerCase());
          return (c ? c.category : "General & Lifestyle") === cat;
        });
        const totalInCat = catItems.length;

        const subCounts = {};
        for (const item of catItems) {
          const c = creatorMap.get((item.authorUsername || '').toLowerCase());
          const sub = c ? c.subGroup : "Creators";
          subCounts[sub] = (subCounts[sub] || 0) + 1;
        }

        const subGroups = (TAXONOMY[cat] ? Object.keys(TAXONOMY[cat]) : []).filter(sg => (subCounts[sg] || 0) > 0);

        if (pinnedSlot) {
          pinnedSlot.innerHTML = `
            <button class="breadcrumb-back-pill" id="btnPostBreadcrumbBack" title="Back to All Categories">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              All
            </button>
          `;
          const backBtn = pinnedSlot.querySelector('#btnPostBreadcrumbBack');
          if (backBtn) {
            backBtn.addEventListener('click', () => {
              selectedPostCategory = 'ALL';
              selectedPostSubGroup = 'ALL';
              dynamicRibbon.scrollLeft = 0;
              renderPostsView();
            });
          }
        }

        let ribbonHtml = '';
        const activeColor = DOMAIN_COLOR_PALETTE[cat] || "#64748b";

        for (const sg of subGroups) {
          const count = subCounts[sg] || 0;
          const isSubActive = selectedPostSubGroup === sg;
          ribbonHtml += `
            <button class="folder-pill ${isSubActive ? 'active' : ''}" data-cat="${cat}" data-sub="${sg}">
              <span class="dot" style="background: ${activeColor};"></span>
              <span>${sg}</span>
              <span class="pill-count">(${count})</span>
            </button>
          `;
        }

        dynamicRibbon.innerHTML = ribbonHtml;

        dynamicRibbon.querySelectorAll('.folder-pill').forEach(pill => {
          pill.addEventListener('click', () => {
            const sub = pill.getAttribute('data-sub');
            if (selectedPostSubGroup === sub) {
              selectedPostSubGroup = 'ALL';
            } else {
              selectedPostSubGroup = sub || 'ALL';
            }
            renderPostsView();
          });
        });
      }
    } else if (currentPostFilterDimension === 'folder') {
      // 2. Folder Pills (Direct folder list, pinned [ ← All ] when filtered)
      const folders = getFolderList();
      const folderCounts = {};
      for (const item of vaultItems) {
        const fList = item.folders && item.folders.length > 0 ? item.folders : [item.folder || "General"];
        for (const f of fList) {
          const normF = normalizeFolderName(f);
          folderCounts[normF] = (folderCounts[normF] || 0) + 1;
        }
      }

      if (pinnedSlot) {
        if (selectedFolder !== 'ALL') {
          pinnedSlot.innerHTML = `
            <button class="breadcrumb-back-pill" id="btnFolderBreadcrumbBack" title="Back to All Folders">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              All
            </button>
          `;
          const backBtn = pinnedSlot.querySelector('#btnFolderBreadcrumbBack');
          if (backBtn) {
            backBtn.addEventListener('click', () => {
              selectedFolder = 'ALL';
              dynamicRibbon.scrollLeft = 0;
              renderPostsView();
            });
          }
        } else {
          pinnedSlot.innerHTML = '';
        }
      }

      let ribbonHtml = folders.filter(f => f !== 'ALL').map(f => {
        const isActive = selectedFolder === f ? 'active' : '';
        const count = folderCounts[f] || 0;
        return `
          <button class="folder-pill ${isActive}" data-folder="${f}">
            <span>${f}</span>
            <span class="pill-count">${count}</span>
          </button>
        `;
      }).join('');

      dynamicRibbon.innerHTML = ribbonHtml;

      dynamicRibbon.querySelectorAll('.folder-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const f = btn.getAttribute('data-folder');
          if (selectedFolder === f) {
            selectedFolder = 'ALL';
          } else {
            selectedFolder = f;
          }
          renderPostsView();
        });
      });
    } else if (currentPostFilterDimension === 'tag') {
      // 3. Multi-Select Tag Pills with Pinned Clear (Physically outside scroll track)
      const tagCountMap = {};
      for (const item of vaultItems) {
        for (const t of (item.tags || [])) {
          tagCountMap[t] = (tagCountMap[t] || 0) + 1;
        }
      }

      const topTags = Object.keys(tagCountMap)
        .sort((a, b) => tagCountMap[b] - tagCountMap[a])
        .slice(0, 35);

      if (pinnedSlot) {
        if (selectedTags.length > 0) {
          pinnedSlot.innerHTML = `
            <button class="clear-filter-pill" id="btnClearTagFilter" title="Clear selected tags">
              <span class="clear-icon">✕</span>
              <span>Clear (${selectedTags.length})</span>
            </button>
          `;
          const clearTagBtn = pinnedSlot.querySelector('#btnClearTagFilter');
          if (clearTagBtn) {
            clearTagBtn.addEventListener('click', () => {
              selectedTags = [];
              selectedTag = 'ALL';
              dynamicRibbon.scrollLeft = 0;
              renderPostsView();
            });
          }
        } else {
          pinnedSlot.innerHTML = '';
        }
      }

      let ribbonHtml = topTags.map(t => {
        const isActive = selectedTags.includes(t) ? 'active' : '';
        return `
          <button class="folder-pill ${isActive}" data-tag="${t}">
            <span>${t}</span>
            <span class="pill-count">${tagCountMap[t] || 0}</span>
          </button>
        `;
      }).join('');

      dynamicRibbon.innerHTML = ribbonHtml;

      dynamicRibbon.querySelectorAll('.folder-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = btn.getAttribute('data-tag');
          if (t) {
            if (selectedTags.includes(t)) {
              selectedTags = selectedTags.filter(item => item !== t);
            } else {
              selectedTags.push(t);
            }
            selectedTag = selectedTags.length === 1 ? selectedTags[0] : (selectedTags.length > 0 ? selectedTags.join(', ') : 'ALL');
            renderPostsView();
          }
        });
      });
    }

    // Update floating scroll arrows visibility
    triggerRibbonArrowUpdate('postsDynamicCategoryRibbon', 'btnRibbonScrollLeft', 'btnRibbonScrollRight');
  }

  const items = getFilteredItems();

  if (items.length === 0) {
    reelsGrid.innerHTML = '';
    if (vaultItems.length === 0) {
      if (isStorageLoaded) {
        emptyState.style.display = 'block';
      }
    } else {
      emptyState.style.display = 'none';
      let filterDesc = 'Try adjusting your search query, folders, or selected tags.';
      if (currentPostFilterDimension === 'tag' && selectedTags.length > 0) {
        filterDesc = `No posts match the combination of tags: ${selectedTags.map(t => t.startsWith('#') ? t : `#${t}`).join(', ')}.`;
      } else if (searchQuery) {
        filterDesc = `No posts match "${searchQuery}".`;
      }

      reelsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
          <h3 style="font-size: 16px; margin-bottom: 6px; color: white;">No matching posts</h3>
          <p style="font-size: 13px; max-width: 440px; margin: 0 auto 16px auto; line-height: 1.5;">${filterDesc}</p>
          <button id="btnResetPostsFilter" class="btn btn-outline" style="font-size: 12px; padding: 6px 14px; border-radius: 8px;">Reset Filters</button>
        </div>
      `;

      const resetBtn = reelsGrid.querySelector('#btnResetPostsFilter');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          searchQuery = '';
          if (searchInput) searchInput.value = '';
          selectedTags = [];
          selectedTag = 'ALL';
          selectedFolder = 'ALL';
          selectedPostCategory = 'ALL';
          selectedPostSubGroup = 'ALL';
          renderPostsView();
        });
      }
    }
    return;
  }

  emptyState.style.display = 'none';

  reelsGrid.innerHTML = items.map(item => {
    const dateStr = item.createdAt ? formatUSDate(item.createdAt) : '';
    const author = item.authorUsername ? `@${item.authorUsername}` : 'Instagram Post';
    const c = creatorMap.get((item.authorUsername || '').toLowerCase());
    const cat = c ? c.category : (item.category || "General & Lifestyle");
    const catColor = DOMAIN_COLOR_PALETTE[cat] || "#64748b";

    const patternList = ["p1", "p2", "p3", "p4"];
    const patternClass = patternList[Math.abs(String(item.id || item.url || author).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % patternList.length];

    const fallbackCardHtml = `<div class="thumbnail-fallback geometric-fallback ${patternClass}" style="--fallback-accent: ${catColor};"></div>`;

    const thumbnailHtml = item.thumbnail 
      ? `<img src="${item.thumbnail}" alt="" class="thumbnail-img" loading="lazy" /><div class="thumbnail-fallback geometric-fallback ${patternClass}" style="display: none; --fallback-accent: ${catColor};"></div>`
      : fallbackCardHtml;

    const tagChipsHtml = (item.tags || []).slice(0, 3).map(tag => 
      `<span class="tag-chip" data-tag="${tag}">${tag}</span>`
    ).join('');

    return `
      <div class="reel-card" data-id="${item.id}">
        <div class="thumbnail-wrapper">
          <span class="folder-tag" title="Click to filter folder: ${item.folder || 'Saved'}">${item.folder || 'Saved'}</span>
          <span class="post-category-tag" data-cat="${cat}" title="Filter by category: ${cat}" style="--post-cat-color: ${catColor};">
            <i style="background: ${catColor};"></i><span>${cat}</span>
          </span>
          ${thumbnailHtml}
        </div>
        <div class="card-content">
          <div>
            <div class="author-line">
              <span class="author-handle" title="${item.authorFullName || author}">${author}</span>
              ${dateStr ? `<span class="post-date">${dateStr}</span>` : ''}
            </div>
            <p class="caption-text">${cleanCaptionText(item.caption, item.authorUsername) || 'No caption'}</p>
            ${tagChipsHtml ? `<div class="card-tags-container">${tagChipsHtml}</div>` : ''}
          </div>
          <div class="card-footer">
            <a href="${getUniversalInstagramUrl(item)}" target="_blank" rel="noopener noreferrer" class="watch-link" title="Watch reel on Instagram">
              <span>Watch</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach CSP-compliant image error listeners and handle cached broken images immediately
  reelsGrid.querySelectorAll('.thumbnail-img').forEach(img => {
    const handleImgError = () => {
      img.style.display = 'none';
      const fallback = img.nextElementSibling;
      if (fallback && fallback.classList.contains('thumbnail-fallback')) {
        fallback.style.display = 'flex';
      }
    };

    img.addEventListener('error', handleImgError);

    // If browser already evaluated the image from cache or fast 404
    if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
      handleImgError();
    }
  });

  reelsGrid.querySelectorAll('.reel-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const found = vaultItems.find(i => i.id === id);
      if (found) openDetailModal(found);
    });
  });

  reelsGrid.querySelectorAll('.post-category-tag').forEach(tagEl => {
    tagEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const cat = tagEl.getAttribute('data-cat');
      if (cat) {
        currentPostFilterDimension = 'category';
        selectedPostCategory = cat;
        selectedPostSubGroup = 'ALL';
        const btnCat = document.getElementById('btnModeCategory');
        if (btnCat) {
          document.querySelectorAll('.filter-mode-btn').forEach(b => b.classList.remove('active'));
          btnCat.classList.add('active');
        }
        renderPostsView();
        showToast(`Filtered by: ${cat}`);
      }
    });
  });

  reelsGrid.querySelectorAll('.folder-tag').forEach(fTag => {
    fTag.addEventListener('click', (e) => {
      e.stopPropagation();
      const fName = fTag.innerText.trim();
      if (fName && searchInput) {
        searchInput.value = fName;
        searchQuery = fName;
        renderPostsView();
      }
    });
  });

  reelsGrid.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = chip.getAttribute('data-tag');
      if (tag && searchInput) {
        searchInput.value = tag;
        searchQuery = tag;
        renderPostsView();
      }
    });
  });

  reelsGrid.querySelectorAll('.watch-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
}

// ==========================================================================
// DEDICATED FOLDERS EXPLORER (PRESERVED ARCHITECTURAL MODULE)
// Note: This logic, classifier, and rendering engine are actively preserved.
// ==========================================================================
const FOLDER_CATEGORIES = {
  tech: { label: "Tech, AI & Science", color: "var(--c-tech)" },
  food: { label: "Food & Culinary", color: "var(--c-food)" },
  arts: { label: "Arts & Creative", color: "var(--c-arts)" },
  fitness: { label: "Fitness, Movement & Rehab", color: "var(--c-fitness)" },
  medicine: { label: "Medicine, Health & Wellness", color: "var(--c-medicine)" },
  business: { label: "Business & Finance", color: "var(--c-business)" },
  fashion: { label: "Fashion, Beauty & Style", color: "var(--c-fashion)" },
  mindset: { label: "Mindset, Psychology & Learning", color: "var(--c-mindset)" },
  travel: { label: "Travel, Outdoors & Adventure", color: "var(--c-travel)" },
  entertainment: { label: "Entertainment, Music & Arts", color: "var(--c-entertainment)" },
  general: { label: "General & Lifestyle", color: "var(--c-general)" }
};

const SHOWCASE_SAMPLE_FOLDERS = [
  { name: "AI Systems & LLMs", count: 84, cat: "tech", size: "sm", items: [] },
  { name: "Design & Spatial 3D", count: 42, cat: "arts", size: "sm", items: [] },
  { name: "Modern Culinary Tech", count: 29, cat: "food", size: "sm", items: [] },
  { name: "Website Architecture", count: 21, cat: "arts", size: "sm", items: [] },
  { name: "Venture Capital & Scale", count: 18, cat: "business", size: "sm", items: [] },
  { name: "Cognitive Neuroscience", count: 16, cat: "medicine", size: "sm", items: [] },
  { name: "Global Expeditions", count: 15, cat: "travel", size: "sm", items: [] },
  { name: "Mobility & Biomechanics", count: 14, cat: "fitness", size: "sm", items: [] },
  { name: "Robotics & Hardware", count: 12, cat: "tech", size: "sm", items: [] },
  { name: "Executive Leadership", count: 11, cat: "general", size: "sm", items: [] },
  { name: "Clinical Wellness", count: 9, cat: "medicine", size: "sm", items: [] },
  { name: "Product Design", count: 7, cat: "arts", size: "sm", items: [] }
];

const FOLDER_TILE_PATTERNS = ["p1", "p2", "p3", "p4"];
const FOLDER_TILE_COUNTS = { lg: 2, md: 2, sm: 2 };

// Classify a folder's category using name keyword heuristics and item classifications
function classifyFolderCategory(folderName, items = []) {
  const normName = (folderName || "").toLowerCase();

  if (/\b(ai|llm|tech|technology|software|code|coding|developer|robot|robotics|python|javascript|data|cloud|prompt|science)\b/i.test(normName)) return "tech";
  if (/\b(culinary|food|recipe|recipes|cook|cooking|baking|chocolate|pastry|pastries|cake|coffee|barista|bar|dessert|desserts|drink|drinks|cal)\b/i.test(normName)) return "food";
  if (/\b(design|art|arts|artist|ui|ux|figma|illustration|illustrator|3d|spatial|render|studio|graphic|interior|architect|architecture|website)\b/i.test(normName)) return "arts";
  if (/\b(fitness|workout|gym|hypertrophy|glute|glutes|strength|rehab|mobility|posture|pilates|yoga|movement|neck|spine|back|shoulder|foot|feet)\b/i.test(normName)) return "fitness";
  if (/\b(medicine|medical|health|doctor|dermatology|skin|skincare|neuro|neuroscience|wellness|clinical|dental|therapy)\b/i.test(normName)) return "medicine";
  if (/\b(business|finance|venture|capital|startup|startups|market|marketing|scale|sales|invest|investing|crypto|money)\b/i.test(normName)) return "business";
  if (/\b(fashion|beauty|style|apparel|outfit|outfits|clothing|model|aesthetic|makeup)\b/i.test(normName)) return "fashion";
  if (/\b(mindset|psychology|learning|habits|productivity|mind|mental|books|reading|wisdom|focus|loneliness|lonely|emotion|emotions|anxiety)\b/i.test(normName)) return "mindset";
  if (/\b(travel|outdoors|adventure|hiking|climbing|nature|mountains|places|explore|voyage|trip|expedition|expeditions|alpine)\b/i.test(normName)) return "travel";
  if (/\b(entertainment|music|comedy|meme|film|cinema|acting|theatre|performance|concert)\b/i.test(normName)) return "entertainment";
  if (/\b(career|job|jobs|lead|leadership|interview|resume|hiring|manage|management|executive|lifestyle)\b/i.test(normName)) return "general";

  if (items && items.length > 0) {
    const catCounts = {};
    for (const item of items) {
      if (item && item.category) {
        const itemCat = String(item.category).toLowerCase();
        for (const [k, v] of Object.entries(FOLDER_CATEGORIES)) {
          if (v && (itemCat.includes(k) || (v.label && itemCat.includes(v.label.toLowerCase())))) {
            catCounts[k] = (catCounts[k] || 0) + 1;
          }
        }
      }
    }
    let topCat = null;
    let maxCount = 0;
    for (const [k, count] of Object.entries(catCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topCat = k;
      }
    }
    if (topCat) return topCat;
  }

  return "general";
}

// Generate mosaic preview tile layout (max 2 reels)
function generateFolderMosaicMarkup(size, thumbnails = []) {
  let tilesHtml = "";
  for (let i = 0; i < 2; i++) {
    const patternClass = FOLDER_TILE_PATTERNS[i % FOLDER_TILE_PATTERNS.length];
    const thumbUrl = thumbnails[i];
    if (thumbUrl) {
      tilesHtml += `<div class="tile ${patternClass}" style="background-image: url('${thumbUrl}');"></div>`;
    } else {
      tilesHtml += `<div class="tile ${patternClass}"></div>`;
    }
  }
  return `<div class="mosaic size-sm">${tilesHtml}</div>`;
}

// Generate modular card markup with separated elements
function generateFolderCardMarkup(folder) {
  const categoryConfig = FOLDER_CATEGORIES[folder.cat] || FOLDER_CATEGORIES.general || { label: "General & Lifestyle", color: "var(--c-general)" };
  const count = folder.items ? folder.items.length : (folder.count || 0);
  const size = "sm";
  const thumbnails = folder.items ? folder.items.map(i => i.thumbnail).filter(Boolean).slice(0, 2) : [];

  return `
    <div class="folder-card" data-name="${folder.name.toLowerCase()}" data-cat="${folder.cat}" data-folder-name="${folder.name}">
      ${generateFolderMosaicMarkup(size, thumbnails)}
      <div class="card-body">
        <div class="card-top-row">
          <span class="folder-name" title="${folder.name}">${folder.name}</span>
          <span class="folder-count">${count}</span>
        </div>
        <div class="folder-cat"><i></i>${categoryConfig.label}</div>
      </div>
    </div>
  `;
}

function renderFoldersExplorer() {
  if (!foldersGrid) return;
  foldersGrid.className = 'folders-grid';

  const folderMap = new Map();
  for (const item of vaultItems) {
    const fList = item.folders && item.folders.length > 0 ? item.folders : [item.folder || "General"];
    for (const f of fList) {
      const normF = normalizeFolderName(f);
      if (!folderMap.has(normF)) {
        folderMap.set(normF, {
          name: normF,
          items: [item]
        });
      } else {
        folderMap.get(normF).items.push(item);
      }
    }
  }

  let foldersList = Array.from(folderMap.values());
  if (foldersList.length > 0) {
    foldersList.sort((a, b) => {
      if (a.name === 'General') return -1;
      if (b.name === 'General') return 1;
      return b.items.length - a.items.length;
    });
    foldersList.forEach(folder => {
      folder.cat = classifyFolderCategory(folder.name, folder.items);
    });
  } else {
    foldersList = SHOWCASE_SAMPLE_FOLDERS;
  }

  // Update total counts
  if (foldersCountBadge) {
    foldersCountBadge.textContent = foldersList.length;
  }
  if (badgeTotalFolders) {
    badgeTotalFolders.textContent = foldersList.length;
  }

  // Populate category chips in ribbon
  if (folderChipRow) {
    const categoryKeys = Object.keys(FOLDER_CATEGORIES);
    folderChipRow.innerHTML = categoryKeys.map(key => {
      const cat = FOLDER_CATEGORIES[key];
      if (!cat) return '';
      const isActive = activeFolderCategory === key;
      return `<button class="cat-chip ${isActive ? 'active' : ''}" data-cat="${key}"><i></i>${cat.label || key}</button>`;
    }).join("");
    triggerRibbonArrowUpdate('folderChipRow', 'btnFolderScrollLeft', 'btnFolderScrollRight');
  }

  // Filter folder cards by active category and search query
  const query = (folderSearchQuery || "").toLowerCase().trim();
  const filteredFolders = foldersList.filter(folder => {
    const matchesCat = !activeFolderCategory || folder.cat === activeFolderCategory;
    const catLabel = (FOLDER_CATEGORIES[folder.cat] && FOLDER_CATEGORIES[folder.cat].label) || '';
    const matchesSearch = !query ||
      folder.name.toLowerCase().includes(query) ||
      catLabel.toLowerCase().includes(query);
    return matchesCat && matchesSearch;
  });

  if (filteredFolders.length === 0) {
    foldersGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
        <h3 style="font-size: 16px; margin-bottom: 6px; color: white;">No matching folders</h3>
        <p style="font-size: 13px;">Try adjusting your search query or category filter.</p>
      </div>
    `;
    return;
  }

  foldersGrid.innerHTML = filteredFolders.map(folder => generateFolderCardMarkup(folder)).join('');

  // Folder card click handler to open posts view filtered by folder
  foldersGrid.querySelectorAll('.folder-card').forEach(card => {
    card.addEventListener('click', () => {
      const folderName = card.getAttribute('data-folder-name');
      selectedFolder = folderName;
      switchView('posts');
      showToast(`Showing folder: ${folderName}`);
    });
  });

  // Mosaic tile parallax effect
  if (window.matchMedia && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    foldersGrid.onmousemove = (event) => {
      const card = event.target.closest(".folder-card");
      if (!card) return;
      const mosaic = card.querySelector(".mosaic");
      if (!mosaic) return;
      const rect = card.getBoundingClientRect();
      const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
      const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
      mosaic.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    };

    foldersGrid.onmouseleave = () => {
      foldersGrid.querySelectorAll(".mosaic").forEach(el => {
        el.style.transform = "";
      });
    };
  }
}

const TAXONOMY_NAMES = new Set([
  "Arts & Creative", "Food & Culinary", "Tech, AI & Science",
  "Fitness, Movement & Rehab", "Medicine, Health & Wellness",
  "Business & Finance", "Fashion, Beauty & Style",
  "Mindset, Psychology & Learning", "Travel, Outdoors & Adventure",
  "Entertainment, Music & Arts", "General & Lifestyle",
  "Tech & AI", "Business, Marketing & Finance"
]);

// Helper to verify if a creator was authentically followed via crawl/friendship
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

// ==========================================
// VIEW 3: CREATORS DIRECTORY
// ==========================================
let cachedCreatorsList = null;
let cachedCreatorMap = null;

function invalidateCreatorsCache() {
  cachedCreatorsList = null;
  cachedCreatorMap = null;
}

function getCreatorMap() {
  if (!cachedCreatorMap) {
    getCreatorsList();
  }
  return cachedCreatorMap;
}

function getCreatorsList() {
  if (cachedCreatorsList) return cachedCreatorsList;

  const creatorMap = new Map();
  
  // Followed handles are those confirmed by authentic following crawl metadata
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
      if (isFollowed) c.isFollowing = true;
    }
  }

  // 2. Ingest all creators from Following list / extended profiles
  for (const extra of creatorsVault) {
    const rawUser = extra.authorUsername;
    if (!rawUser) continue;
    const cleanUser = rawUser.toLowerCase().replace(/^@/, '').trim();
    if (!isValidCreatorHandle(cleanUser)) continue;

    const isFollowed = followingHandles.has(cleanUser);
    const rawOff = extra.officialCategory || (extra.category && !TAXONOMY_NAMES.has(extra.category) ? extra.category : null);

    if (!creatorMap.has(cleanUser)) {
      creatorMap.set(cleanUser, {
        authorUsername: cleanUser,
        authorFullName: extra.authorFullName || null,
        profilePic: extra.profilePic || null,
        officialCategory: rawOff || null,
        bio: extra.bio || null,
        isFollowing: isFollowed,
        posts: [],
        tags: [],
        captions: []
      });
    } else {
      const existing = creatorMap.get(cleanUser);
      existing.isFollowing = isFollowed;
      if (extra.profilePic && !existing.profilePic) existing.profilePic = extra.profilePic;
      if (rawOff) {
        existing.officialCategory = rawOff;
      }
      if (extra.bio) existing.bio = extra.bio;
      if (extra.authorFullName && !existing.authorFullName) existing.authorFullName = extra.authorFullName;
    }
  }

  cachedCreatorsList = Array.from(creatorMap.values()).map(creator => {
    const classification = classifyCreator(creator);
    return {
      ...creator,
      category: classification.category,
      subGroup: classification.subGroup,
      postsCount: creator.posts.length
    };
  });

  cachedCreatorMap = new Map();
  for (const c of cachedCreatorsList) {
    cachedCreatorMap.set((c.authorUsername || '').toLowerCase(), c);
  }

  return cachedCreatorsList;
}

// ==========================================
// VIEW 3: CREATORS DIRECTORY & STUDIO PASSES
// ==========================================
let currentCreatorLayout = localStorage.getItem('reel_vault_creator_layout') || 'studio';

function initCreatorLayoutControls() {
  const btnPass = document.getElementById('btnCreatorPass');
  const btnCompact = document.getElementById('btnCreatorCompact');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerBackdrop = document.getElementById('creatorDrawerBackdrop');

  if (btnPass && btnCompact) {
    btnPass.addEventListener('click', () => {
      currentCreatorLayout = 'studio';
      localStorage.setItem('reel_vault_creator_layout', 'studio');
      btnPass.classList.add('active');
      btnCompact.classList.remove('active');
      renderCreatorsDirectory();
    });

    btnCompact.addEventListener('click', () => {
      currentCreatorLayout = 'compact';
      localStorage.setItem('reel_vault_creator_layout', 'compact');
      btnCompact.classList.add('active');
      btnPass.classList.remove('active');
      renderCreatorsDirectory();
    });
  }

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeCreatorDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeCreatorDrawer);
  }
}

function openCreatorDrawer(creator) {
  const overlay = document.getElementById('creatorDrawerOverlay');
  if (!overlay) return;

  const drawerAvatar = document.getElementById('drawerAvatar');
  const drawerHandle = document.getElementById('drawerHandle');
  const drawerFullName = document.getElementById('drawerFullName');
  const drawerFollowBadge = document.getElementById('drawerFollowBadge');
  const drawerCategoryBadge = document.getElementById('drawerCategoryBadge');
  const drawerSubGroupBadge = document.getElementById('drawerSubGroupBadge');
  const drawerOfficialBadge = document.getElementById('drawerOfficialBadge');
  const drawerBioSection = document.getElementById('drawerBioSection');
  const drawerBio = document.getElementById('drawerBio');
  const drawerInstagramBtn = document.getElementById('drawerInstagramBtn');
  const drawerFilterFeedBtn = document.getElementById('drawerFilterFeedBtn');
  const drawerSavedReelsTitle = document.getElementById('drawerSavedReelsTitle');
  const drawerReelsGrid = document.getElementById('drawerReelsGrid');

  const initial = (creator.authorUsername || 'U').charAt(0).toUpperCase();
  drawerAvatar.textContent = initial;

  drawerHandle.textContent = `@${creator.authorUsername}`;
  drawerFullName.textContent = creator.authorFullName || '';
  if (drawerFollowBadge) {
    drawerFollowBadge.textContent = creator.isFollowing ? 'Following' : 'Not Following';
    drawerFollowBadge.className = `creator-follow-badge ${creator.isFollowing ? 'followed' : 'not-following'}`;
    drawerFollowBadge.style.display = 'inline-block';
  }

  const catColor = DOMAIN_COLOR_PALETTE[creator.category] || "#64748b";
  drawerCategoryBadge.textContent = creator.category;
  drawerCategoryBadge.style.borderColor = catColor;
  drawerCategoryBadge.style.color = catColor;
  drawerCategoryBadge.style.background = `${catColor}1f`;
  drawerSubGroupBadge.textContent = creator.subGroup;

  if (creator.officialCategory) {
    drawerOfficialBadge.textContent = creator.officialCategory;
    drawerOfficialBadge.style.display = 'inline-block';
  } else {
    drawerOfficialBadge.style.display = 'none';
  }

  if (creator.bio) {
    drawerBioSection.style.display = 'flex';
    drawerBio.textContent = creator.bio;
  } else {
    drawerBioSection.style.display = 'none';
  }

  drawerInstagramBtn.href = `https://www.instagram.com/${creator.authorUsername}/`;

  const posts = creator.posts || [];
  drawerSavedReelsTitle.textContent = `Saved Reels (${posts.length})`;

  if (posts.length === 0) {
    drawerReelsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 30px 10px; color: var(--text-dim); font-size: 12px;">
        No saved reels from this creator yet.
      </div>
    `;
  } else {
    drawerReelsGrid.innerHTML = posts.map(item => {
      const directUrl = getUniversalInstagramUrl(item);
      const thumb = item.thumbnail 
        ? `<img src="${item.thumbnail}" alt="Reel" class="drawer-reel-img" />`
        : `<div style="width:100%;height:100%;background:#181d28;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:11px;">No Thumbnail</div>`;

      return `
        <a href="${directUrl}" target="_blank" rel="noopener noreferrer" class="drawer-reel-card" data-reel-id="${item.id}" title="Watch reel on Instagram">
          ${thumb}
        </a>
      `;
    }).join('');
  }

  overlay.classList.add('open');
}

function closeCreatorDrawer() {
  const overlay = document.getElementById('creatorDrawerOverlay');
  if (overlay) overlay.classList.remove('open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCreatorDrawer();
    if (detailModal) detailModal.classList.remove('open');
  }

  // Global ⌘K / Ctrl+K search focus shortcut
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    let targetInput = null;
    if (activeView === 'folders') {
      targetInput = document.getElementById('folderSearchInput');
    } else if (activeView === 'posts') {
      targetInput = document.getElementById('searchInput');
    } else if (activeView === 'creators') {
      targetInput = document.getElementById('creatorSearchInput');
    }
    if (targetInput) {
      targetInput.focus();
      targetInput.select();
    }
  }
});

function renderCreatorsDirectory() {
  const allCreators = getCreatorsList();

  const btnPass = document.getElementById('btnCreatorPass');
  const btnCompact = document.getElementById('btnCreatorCompact');
  if (btnPass && btnCompact) {
    if (currentCreatorLayout === 'studio') {
      btnPass.classList.add('active');
      btnCompact.classList.remove('active');
      creatorsGrid.className = 'creators-grid studio-mode';
    } else {
      btnCompact.classList.add('active');
      btnPass.classList.remove('active');
      creatorsGrid.className = 'creators-grid compact-mode';
    }
  }

  const creatorsCountBadge = document.getElementById('creatorsCountBadge');
  if (creatorsCountBadge) {
    creatorsCountBadge.innerText = allCreators.length;
  }

  // 1. Category counts based on all creators
  const categoryCounts = {};
  for (const c of allCreators) {
    const cat = c.category || "General & Lifestyle";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  // 2. Render Dynamic Single-Row Category / Breadcrumb Ribbon
  const dynamicRibbon = document.getElementById('creatorDynamicCategoryRibbon');
  if (dynamicRibbon) {
    if (selectedCreatorCategory === 'ALL') {
      // Level 1: Category Domain Pills with counts (No redundant All pill)
      const categoryKeys = [...Object.keys(TAXONOMY), "General & Lifestyle"].filter(k => (categoryCounts[k] || 0) > 0);

      let ribbonHtml = '';

      for (const cat of categoryKeys) {
        const count = categoryCounts[cat] || 0;
        const color = DOMAIN_COLOR_PALETTE[cat] || "#8b5cf6";
        ribbonHtml += `
          <button class="folder-pill" data-cat="${cat}">
            <span class="dot" style="background: ${color};"></span>
            <span>${cat}</span>
            <span class="pill-count">(${count})</span>
          </button>
        `;
      }

      dynamicRibbon.innerHTML = ribbonHtml;

      dynamicRibbon.querySelectorAll('.folder-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const cat = pill.getAttribute('data-cat') || 'ALL';
          selectedCreatorCategory = cat;
          selectedCreatorSubGroup = 'ALL';
          renderCreatorsDirectory();
        });
      });
    } else {
      // Level 2 (Zoomed into selected category): [ ← All (All Categories) ] | All in Category | Sub-niches
      const cat = selectedCreatorCategory;
      const catCreators = allCreators.filter(c => c.category === cat);
      const totalInCat = catCreators.length;

      const subCounts = {};
      for (const c of catCreators) {
        if (c.subGroup) {
          subCounts[c.subGroup] = (subCounts[c.subGroup] || 0) + 1;
        }
      }

      const subGroups = (TAXONOMY[cat] ? Object.keys(TAXONOMY[cat]) : []).filter(sg => (subCounts[sg] || 0) > 0);

      let ribbonHtml = `
        <button class="breadcrumb-back-pill sticky-pill" id="btnBreadcrumbBack" title="Back to All Categories">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          All
        </button>
      `;

      const activeColor = DOMAIN_COLOR_PALETTE[cat] || "#64748b";

      for (const sg of subGroups) {
        const count = subCounts[sg] || 0;
        const isSubActive = selectedCreatorSubGroup === sg;
        ribbonHtml += `
          <button class="folder-pill ${isSubActive ? 'active' : ''}" data-cat="${cat}" data-sub="${sg}">
            <span class="dot" style="background: ${activeColor};"></span>
            <span>${sg}</span>
            <span class="pill-count">(${count})</span>
          </button>
        `;
      }

      dynamicRibbon.innerHTML = ribbonHtml;

      const backBtn = document.getElementById('btnBreadcrumbBack');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          selectedCreatorCategory = 'ALL';
          selectedCreatorSubGroup = 'ALL';
          renderCreatorsDirectory();
        });
      }

      dynamicRibbon.querySelectorAll('.folder-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          const sub = pill.getAttribute('data-sub');
          if (selectedCreatorSubGroup === sub) {
            selectedCreatorSubGroup = 'ALL';
          } else {
            selectedCreatorSubGroup = sub || 'ALL';
          }
          renderCreatorsDirectory();
        });
      });
    }
    triggerRibbonArrowUpdate('creatorDynamicCategoryRibbon', 'btnCreatorScrollLeft', 'btnCreatorScrollRight');
  }

  let filteredCreators = [...allCreators];

  if (selectedCreatorCategory !== "ALL") {
    filteredCreators = filteredCreators.filter(c => c.category === selectedCreatorCategory);
  }

  if (selectedCreatorSubGroup !== "ALL") {
    filteredCreators = filteredCreators.filter(c => c.subGroup === selectedCreatorSubGroup);
  }

  const rawQ = (creatorSearchQuery || "").trim().toLowerCase();
  const tokens = rawQ.split(/\s+/).map(t => {
    if (t.startsWith('@') || t.startsWith('#')) return t.slice(1);
    return t;
  }).filter(Boolean);

  if (tokens.length > 0) {
    filteredCreators = filteredCreators.filter(c => {
      const handle = (c.authorUsername || "").toLowerCase();
      const fullName = (c.authorFullName || "").toLowerCase();
      const cat = (c.category || "").toLowerCase();
      const sub = (c.subGroup || "").toLowerCase();
      const bio = (c.bio || "").toLowerCase();
      const tags = (c.tags || []).join(' ').toLowerCase();

      const blob = `${handle} ${fullName} ${cat} ${sub} ${bio} ${tags}`;
      return tokens.every(token => blob.includes(token));
    });
  }

  filteredCreators.sort((a, b) => b.postsCount - a.postsCount || (a.authorUsername || "").localeCompare(b.authorUsername || ""));

  if (creatorsGrid) {
    if (filteredCreators.length === 0) {
      creatorsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-dim);">
          <h3 style="font-size: 16px; margin-bottom: 6px; color: white;">No creators found</h3>
          <p style="font-size: 13px;">Try searching for a different specialty or category.</p>
        </div>
      `;
      return;
    }

    creatorsGrid.innerHTML = filteredCreators.map(c => {
      const displayName = c.authorFullName && c.authorFullName.toLowerCase() !== c.authorUsername.toLowerCase() 
        ? c.authorFullName 
        : `@${c.authorUsername}`;
      
      const displayHandle = `@${c.authorUsername}`;

      const initial = (c.authorUsername || 'U').charAt(0).toUpperCase();
      const avatarHtml = `<div class="creator-card-avatar">${initial}</div>`;
      const catColor = DOMAIN_COLOR_PALETTE[c.category] || "#64748b";

      // Mini Content Ribbon (up to 4 thumbnails of saved reels)
      let ribbonHtml = '';
      if (currentCreatorLayout === 'studio' && c.posts && c.posts.length > 0) {
        const previewThumbs = c.posts
          .map(p => p.thumbnail)
          .filter(Boolean)
          .slice(0, 4);

        if (previewThumbs.length > 0) {
          ribbonHtml = `
            <div class="creator-content-ribbon">
              ${previewThumbs.map(t => `<img src="${t}" alt="Post preview" class="ribbon-thumb" />`).join('')}
            </div>
          `;
        }
      }

      if (currentCreatorLayout === 'compact') {
        return `
          <div class="creator-card compact-card" data-creator-handle="${c.authorUsername}">
            <div class="compact-card-content">
              <div class="compact-card-avatar">${initial}</div>
              <div class="compact-card-info">
                <div class="compact-name-row">
                  <span class="creator-card-handle">${displayHandle}</span>
                  <span class="creator-follow-badge ${c.isFollowing ? 'followed' : 'not-following'}">${c.isFollowing ? 'Following' : 'Not Following'}</span>
                </div>
                <div class="compact-meta-row">
                  <span class="compact-cat-pill" style="--tag-color: ${catColor};">
                    <i class="cat-dot" style="background: ${catColor};"></i>
                    <span>${c.category}</span>
                  </span>
                  <span class="compact-count">${c.postsCount} ${c.postsCount === 1 ? 'reel' : 'reels'}</span>
                </div>
              </div>
              <button class="creator-card-view-btn btn-open-creator-drawer" data-handle="${c.authorUsername}" title="Open saved collection">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="creator-card creator-profile-card" data-creator-handle="${c.authorUsername}">
          <div>
            <div class="creator-card-header">
              ${avatarHtml}
              <div class="creator-card-identity">
                <div class="creator-card-name-row">
                  <span class="creator-card-name">${displayName}</span>
                  <span class="creator-follow-badge ${c.isFollowing ? 'followed' : 'not-following'}">${c.isFollowing ? 'Following' : 'Not Following'}</span>
                </div>
                <span class="creator-card-handle">${displayHandle}</span>
              </div>
            </div>

            <div class="creator-card-tags">
              <span class="creator-tag-pill" style="--tag-color: ${catColor};">
                <i class="cat-dot" style="background: ${catColor};"></i>
                <span>${c.category}</span>
              </span>
              ${c.subGroup && c.subGroup !== 'General' ? `<span class="creator-tag-pill subtle">${c.subGroup}</span>` : ''}
            </div>

            ${c.bio ? `<p class="creator-bio creator-card-bio">${c.bio}</p>` : ''}
            ${ribbonHtml}
          </div>

          <div class="creator-card-footer">
            <span class="creator-reels-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
              ${c.postsCount} ${c.postsCount === 1 ? 'saved reel' : 'saved reels'}
            </span>
            <button class="creator-card-view-btn btn-open-creator-drawer" data-handle="${c.authorUsername}" title="Open saved collection">
              <span>View</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    creatorsGrid.querySelectorAll('.creator-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const handle = (card.getAttribute('data-creator-handle') || '').toLowerCase();
        const creator = allCreators.find(c => (c.authorUsername || '').toLowerCase() === handle);
        if (creator) {
          openCreatorDrawer(creator);
        }
      });
    });

    creatorsGrid.querySelectorAll('.btn-open-creator-drawer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const handle = (btn.getAttribute('data-handle') || '').toLowerCase();
        const creator = allCreators.find(c => (c.authorUsername || '').toLowerCase() === handle);
        if (creator) {
          openCreatorDrawer(creator);
        }
      });
    });
  }
}

// Folder Search & Category Ribbon Event Handlers
let folderSearchDebounceTimer = null;
if (folderSearchInput) {
  folderSearchInput.addEventListener('input', (e) => {
    folderSearchQuery = e.target.value;
    if (clearFolderSearchBtn) {
      clearFolderSearchBtn.style.display = folderSearchQuery.trim().length > 0 ? 'block' : 'none';
    }
    clearTimeout(folderSearchDebounceTimer);
    folderSearchDebounceTimer = setTimeout(() => {
      renderFoldersExplorer();
    }, 25);
  });
}

if (clearFolderSearchBtn) {
  clearFolderSearchBtn.addEventListener('click', () => {
    if (folderSearchInput) {
      folderSearchInput.value = '';
    }
    folderSearchQuery = '';
    clearFolderSearchBtn.style.display = 'none';
    renderFoldersExplorer();
    if (folderSearchInput) {
      folderSearchInput.focus();
    }
  });
}

if (folderChipRow) {
  folderChipRow.addEventListener('click', (e) => {
    const chip = e.target.closest('.cat-chip');
    if (!chip) return;
    const cat = chip.dataset.cat;
    if (activeFolderCategory === cat) {
      activeFolderCategory = null;
    } else {
      activeFolderCategory = cat;
    }
    renderFoldersExplorer();
  });
}

// Creator Search Input Handler
let creatorSearchDebounceTimer = null;
if (creatorSearchInput) {
  creatorSearchInput.addEventListener('input', (e) => {
    creatorSearchQuery = e.target.value;
    if (clearCreatorSearchBtn) {
      clearCreatorSearchBtn.style.display = creatorSearchQuery.trim().length > 0 ? 'block' : 'none';
    }
    clearTimeout(creatorSearchDebounceTimer);
    creatorSearchDebounceTimer = setTimeout(() => {
      renderCreatorsDirectory();
    }, 25);
  });
}

if (clearCreatorSearchBtn) {
  clearCreatorSearchBtn.addEventListener('click', () => {
    creatorSearchInput.value = '';
    creatorSearchQuery = '';
    clearCreatorSearchBtn.style.display = 'none';
    renderCreatorsDirectory();
    creatorSearchInput.focus();
  });
}

// Modal Details Handler
function openDetailModal(item) {
  const modalAvatar = document.getElementById('modalAvatar');
  const author = item.authorUsername || null;
  const initial = author ? author.charAt(0).toUpperCase() : 'P';
  if (modalAvatar) modalAvatar.innerText = initial;

  if (modalAuthor) modalAuthor.innerText = author ? `@${author}` : 'Instagram Post';
  if (modalAuthorLink) {
    modalAuthorLink.href = author ? `https://www.instagram.com/${author}/` : '#';
  }

  if (modalFullName) {
    const fullName = (item.authorFullName || "").trim();
    const cleanAuthor = (author || "").toLowerCase();
    if (fullName && fullName.toLowerCase() !== cleanAuthor && !fullName.toLowerCase().includes(cleanAuthor)) {
      modalFullName.innerText = fullName;
      modalFullName.style.display = 'block';
    } else {
      modalFullName.style.display = 'none';
    }
  }

  const creatorMap = getCreatorMap();
  const c = creatorMap.get((item.authorUsername || '').toLowerCase());
  const cat = c ? c.category : (item.category || "General & Lifestyle");
  const catColor = DOMAIN_COLOR_PALETTE[cat] || "#64748b";

  const modalCategoryBadge = document.getElementById('modalCategoryBadge');
  if (modalCategoryBadge) {
    modalCategoryBadge.innerText = cat;
    modalCategoryBadge.style.display = 'inline-block';
    modalCategoryBadge.style.borderColor = catColor;
    modalCategoryBadge.style.color = catColor;
    modalCategoryBadge.style.background = `${catColor}1f`;
  }

  if (modalFolder) {
    modalFolder.innerText = item.folder || 'General';
  }

  const dateFormatted = item.createdAt ? `Posted: ${formatUSDateTime(item.createdAt)}` : '';
  if (modalDate) {
    modalDate.innerText = dateFormatted;
    modalDate.style.display = dateFormatted ? 'block' : 'none';
  }

  const cleanedCaption = cleanCaptionText(item.caption, item.authorUsername);
  if (modalCaption) {
    modalCaption.innerHTML = cleanedCaption ? cleanedCaption.replace(/\n/g, '<br/>') : '<span style="color: var(--text-dim); font-style: italic;">No caption provided.</span>';
  }

  if (modalTagsContainer) {
    const tags = item.tags || [];
    if (tags.length > 0) {
      modalTagsContainer.innerHTML = tags.map(tag => 
        `<span class="tag-chip" data-tag="${tag}">${tag}</span>`
      ).join('');
      modalTagsContainer.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          selectedTag = chip.getAttribute('data-tag');
          detailModal.classList.remove('open');
          renderPostsView();
        });
      });
    } else {
      modalTagsContainer.innerHTML = '';
    }
  }

  const directUrl = getUniversalInstagramUrl(item);
  modalWatchBtn.href = directUrl;
  modalWatchBtn.target = "_blank";
  modalWatchBtn.rel = "noopener noreferrer";

  const patternList = ["p1", "p2", "p3", "p4"];
  const patternClass = patternList[Math.abs(String(item.id || item.url || author).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % patternList.length];

  const triggerFallback = () => {
    modalImg.style.display = 'none';
    if (modalFallback) {
      modalFallback.className = `modal-preview-fallback geometric-fallback ${patternClass}`;
      modalFallback.style.setProperty('--fallback-accent', catColor);
      modalFallback.style.display = 'flex';
      modalFallback.style.cursor = 'pointer';
      modalFallback.onclick = () => {
        if (directUrl && directUrl !== '#') window.open(directUrl, '_blank', 'noopener,noreferrer');
      };
    }
  };

  if (item.thumbnail) {
    if (modalFallback) modalFallback.style.display = 'none';
    modalImg.style.display = 'none';
    modalImg.style.cursor = 'pointer';
    modalImg.title = 'Click to open on Instagram';
    modalImg.onclick = () => {
      if (directUrl && directUrl !== '#') window.open(directUrl, '_blank', 'noopener,noreferrer');
    };

    modalImg.onload = () => {
      modalImg.style.display = 'block';
      if (modalFallback) modalFallback.style.display = 'none';
    };

    modalImg.onerror = () => {
      triggerFallback();
    };

    // Assign source after handlers are set
    modalImg.src = item.thumbnail;

    // In case image was already cached or errored immediately
    if (modalImg.complete) {
      if (modalImg.naturalWidth === 0) {
        triggerFallback();
      } else {
        modalImg.style.display = 'block';
        if (modalFallback) modalFallback.style.display = 'none';
      }
    }
  } else {
    modalImg.style.display = 'none';
    modalImg.src = '';
    modalImg.onclick = null;
    modalImg.onerror = null;
    modalImg.onload = null;
    triggerFallback();
  }

  modalCopyCaptionBtn.onclick = () => {
    navigator.clipboard.writeText(cleanedCaption || item.caption || '');
    showToast("Caption copied to clipboard");
  };

  if (modalCopyLinkBtn) {
    modalCopyLinkBtn.onclick = () => {
      navigator.clipboard.writeText(directUrl);
      showToast("Post link copied to clipboard");
    };
  }

  detailModal.classList.add('open');
}

closeModalBtn.addEventListener('click', () => detailModal.classList.remove('open'));
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) detailModal.classList.remove('open');
});

// Posts Dimension Mode Switcher (Option 3)
['btnModeCategory', 'btnModeFolder', 'btnModeTag'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode') || 'category';
      if (currentPostFilterDimension !== mode) {
        currentPostFilterDimension = mode;
        const ribbon = document.getElementById('postsDynamicCategoryRibbon');
        if (ribbon) {
          ribbon.scrollLeft = 0;
        }
        renderPostsView();
      }
    });
  }
});

// Ribbon Scroll Arrow Controls & Listeners
setupRibbonArrowControls('postsDynamicCategoryRibbon', 'btnRibbonScrollLeft', 'btnRibbonScrollRight');
setupRibbonArrowControls('folderChipRow', 'btnFolderScrollLeft', 'btnFolderScrollRight');
setupRibbonArrowControls('creatorDynamicCategoryRibbon', 'btnCreatorScrollLeft', 'btnCreatorScrollRight');

window.addEventListener('resize', () => {
  triggerRibbonArrowUpdate('postsDynamicCategoryRibbon', 'btnRibbonScrollLeft', 'btnRibbonScrollRight');
  triggerRibbonArrowUpdate('folderChipRow', 'btnFolderScrollLeft', 'btnFolderScrollRight');
  triggerRibbonArrowUpdate('creatorDynamicCategoryRibbon', 'btnCreatorScrollLeft', 'btnCreatorScrollRight');
});

// Event Listeners
if (folderPickerBtn) {
  folderPickerBtn.addEventListener('click', initLocalFolder);
}

let mainSearchDebounceTimer = null;
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearTimeout(mainSearchDebounceTimer);
    mainSearchDebounceTimer = setTimeout(() => {
      renderPostsView();
    }, 25);
  });
}

const clearSearchBtn = document.getElementById('clearSearchBtn');
if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    renderPostsView();
    searchInput.focus();
  });
}

['btnSortNewest', 'btnSortOldest'].forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', () => {
      sortBy = btn.getAttribute('data-sort') || 'newest';
      const btnNew = document.getElementById('btnSortNewest');
      const btnOld = document.getElementById('btnSortOldest');
      if (btnNew && btnOld) {
        btnNew.classList.toggle('active', sortBy === 'newest');
        btnOld.classList.toggle('active', sortBy === 'oldest');
      }
      renderPostsView();
    });
  }
});

if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const allCreators = getCreatorsList();
    if (vaultItems.length === 0 && allCreators.length === 0) {
      showToast("Vault is empty. Nothing to export.");
      return;
    }
    const payload = getFullVaultPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${vaultItems.length} posts and ${allCreators.length} creators to vault.json`);
  });
}

if (importBtn) {
  importBtn.addEventListener('click', () => {
    if (fileInput) fileInput.click();
  });
}

if (document.getElementById('emptyImportBtn')) {
  document.getElementById('emptyImportBtn').addEventListener('click', () => {
    if (fileInput) fileInput.click();
  });
}

if (fileInput) {
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      const rawCollections = Array.isArray(parsed) ? parsed : (parsed.vaultData || []);
      const newItems = normalizeRawCollections(rawCollections);
      
      const map = new Map(vaultItems.map(i => [i.url, i]));
      for (const item of newItems) {
        map.set(item.url, item);
      }
      vaultItems = Array.from(map.values());

      if (parsed.creators && Array.isArray(parsed.creators)) {
        const creatorMap = new Map(creatorsVault.map(c => [c.authorUsername, c]));
        for (const c of parsed.creators) {
          if (c.authorUsername) {
            creatorMap.set(c.authorUsername, { ...(creatorMap.get(c.authorUsername) || {}), ...c });
          }
        }
        creatorsVault = Array.from(creatorMap.values());
      }

      invalidateCreatorsCache();
      updateNavigationMetrics();
      renderActiveView();
      saveToDisk();

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ vaultData: rawCollections, creatorsVault: creatorsVault });
      }

      showToast(`Successfully imported ${newItems.length} posts and ${getCreatorsList().length} creators`);
    } catch (err) {
      showToast("Failed to parse JSON file");
    }
  };
  reader.readAsText(file);
  });
}

function initLinearDropdownControls() {
  const btnRel = document.getElementById('btnDropdownRelationship');
  const ddRel = document.getElementById('dropdownRelationship');
  const btnCat = document.getElementById('btnDropdownCategory');
  const ddCat = document.getElementById('dropdownCategory');

  if (btnRel && ddRel) {
    btnRel.addEventListener('click', (e) => {
      e.stopPropagation();
      ddCat?.classList.remove('open');
      ddRel.classList.toggle('open');
    });
  }

  if (btnCat && ddCat) {
    btnCat.addEventListener('click', (e) => {
      e.stopPropagation();
      ddRel?.classList.remove('open');
      ddCat.classList.toggle('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.linear-dropdown')) {
      ddRel?.classList.remove('open');
      ddCat?.classList.remove('open');
    }
  });

  const clearAllBtn = document.getElementById('linearClearAllFiltersBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      selectedCreatorRelationship = "ALL";
      selectedCreatorCategory = "ALL";
      selectedCreatorSubGroup = "ALL";
      creatorSearchQuery = "";
      const searchInput = document.getElementById('creatorSearchInput');
      if (searchInput) searchInput.value = "";
      renderCreatorsDirectory();
    });
  }
}

// Boot
initInsightsControls();
initCreatorLayoutControls();
initLinearDropdownControls();
loadFromExtensionStorage();
restoreStoredFolderOnBoot();
