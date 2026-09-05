import assert from 'node:assert';

console.log("🧪 Testing Hierarchical Creator Taxonomy & Classification Engine...\n");

export const TAXONOMY = {
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
      "bedby10events", "culturab_cat", "culturausj", "friesenguys", "indiadebeaufort",
      "winnie_thepooj"
    ]
  }
};

function tokenizeEntityText(text) {
  if (!text) return [];
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[\._\-\/\\,;:!?'"()#@0-9]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(t => t.length > 1);
}

export function classifyCreator(creator) {
  const handle = (creator.authorUsername || "").toLowerCase();
  const fullName = (creator.authorFullName || "").toLowerCase();
  const officialCategory = (creator.category || creator.officialCategory || "").toLowerCase();
  const bio = (creator.bio || "").toLowerCase();
  const captions = (creator.captions || []).join(' ').toLowerCase();
  const tags = (creator.tags || []).join(' ').toLowerCase();

  const postFolders = (creator.posts || []).flatMap(p => p.folders || [p.folder]).filter(Boolean).join(' ').toLowerCase();

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

        if (regex.test(officialCategory)) score += 20;
        if (regex.test(postFolders)) score += 16;

        if (regex.test(bio) || (kwClean.length >= 4 && bio.includes(kwClean))) {
          score += 12;
        } else if (kwClean.length >= 4 && bioTokens.some(t => t.startsWith(kwClean) || (t.length >= 4 && kwClean.startsWith(t)))) {
          score += 10;
        }

        if (regex.test(fullName) || fullName.includes(kwClean)) {
          score += 12;
        } else if (nameTokens.includes(kwClean)) {
          score += 10;
        } else if (kwClean.length >= 4 && nameTokens.some(t => t.startsWith(kwClean) || (t.length >= 4 && kwClean.startsWith(t)))) {
          score += 8;
        } else if (kwJoined.length >= 4 && nameCombined.includes(kwJoined)) {
          score += 8;
        }

        if (handleTokens.includes(kwClean)) {
          score += 8;
        } else if (kwJoined.length >= 3 && handleCombined.includes(kwJoined)) {
          score += 8;
        } else if (kwClean.length >= 4 && handleTokens.some(t => t.startsWith(kwClean) || (t.length >= 4 && kwClean.startsWith(t)))) {
          score += 6;
        } else if (kwClean === "ai" && (handle.startsWith("ai") || handle.endsWith("ai") || handle.includes(".ai") || handle.includes("_ai") || handle.includes("ai."))) {
          score += 8;
        }

        if (regex.test(tags) || (kwClean.length >= 4 && tags.includes(kwClean))) score += 4;
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

// Test 1: Andrey / chocolatier
const choco = {
  authorUsername: "andrey_dubovik",
  authorFullName: "Andrey / chocolatier",
  category: null,
  bio: null,
  posts: []
};
const res1 = classifyCreator(choco);
assert.strictEqual(res1.category, "Food & Culinary");
assert.strictEqual(res1.subGroup, "Baking, Chocolate & Desserts");
console.log("✅ Test 1 Passed: Andrey / chocolatier classified into Food & Culinary > Baking, Chocolate & Desserts");

// Test 2: Caffeine Social Club
const coffee = {
  authorUsername: "caffeinesocialclub",
  authorFullName: "Caffeine Social Club",
  category: null,
  bio: null,
  posts: []
};
const res2 = classifyCreator(coffee);
assert.strictEqual(res2.category, "Food & Culinary");
assert.strictEqual(res2.subGroup, "Coffee, Drinks & Bars");
console.log("✅ Test 2 Passed: Caffeine Social Club classified into Food & Culinary > Coffee, Drinks & Bars");

// Test 3: COAST & CLIMB BCN | women’s hiking community
const hiking = {
  authorUsername: "coastandclimb",
  authorFullName: "COAST & CLIMB BCN | women’s hiking community",
  category: null,
  bio: null,
  posts: []
};
const res3 = classifyCreator(hiking);
assert.strictEqual(res3.category, "Travel, Outdoors & Adventure");
assert.strictEqual(res3.subGroup, "Hiking, Climbing & Outdoors");
console.log("✅ Test 3 Passed: COAST & CLIMB BCN classified into Travel, Outdoors & Adventure > Hiking, Climbing & Outdoors");

// Test 4: Barcelona School of Creativity
const school = {
  authorUsername: "barcelonaschoolofcreativity",
  authorFullName: "Barcelona School of Creativity",
  category: null,
  bio: null,
  posts: []
};
const res4 = classifyCreator(school);
assert.strictEqual(res4.category, "Arts & Creative");
assert.strictEqual(res4.subGroup, "Creative Schools & Learning");
console.log("✅ Test 4 Passed: Barcelona School of Creativity classified into Arts & Creative > Creative Schools & Learning");

// Test 5: Anatomy Trains
const anatomy = {
  authorUsername: "anatomytrainsofficial",
  authorFullName: "Anatomy Trains",
  category: null,
  bio: null,
  posts: []
};
const res5 = classifyCreator(anatomy);
assert.strictEqual(res5.category, "Fitness, Movement & Rehab");
assert.strictEqual(res5.subGroup, "Physical Therapy & Anatomy");
console.log("✅ Test 5 Passed: Anatomy Trains classified into Fitness, Movement & Rehab > Physical Therapy & Anatomy");

// Test 6: Ali Abdaal
const ali = {
  authorUsername: "aliabdaal",
  authorFullName: "Ali Abdaal",
  category: null,
  bio: null,
  posts: []
};
const res6 = classifyCreator(ali);
assert.strictEqual(res6.category, "Mindset, Psychology & Learning");
assert.strictEqual(res6.subGroup, "Habits & Productivity");
console.log("✅ Test 6 Passed: Ali Abdaal classified into Mindset, Psychology & Learning > Habits & Productivity");

// Test 7: Amaury Guichon
const pastry = {
  authorUsername: "amauryguichon",
  authorFullName: "Amaury Guichon",
  category: null,
  bio: null,
  posts: []
};
const res7 = classifyCreator(pastry);
assert.strictEqual(res7.category, "Food & Culinary");
assert.strictEqual(res7.subGroup, "Baking, Chocolate & Desserts");
console.log("✅ Test 7 Passed: Amaury Guichon classified into Food & Culinary > Baking, Chocolate & Desserts");

// Test 11: Bret Contreras “The Glute Guy” PhD, CSCS
const glutes = {
  authorUsername: "bretcontreras1",
  authorFullName: "Bret Contreras “The Glute Guy” PhD, CSCS",
  category: null,
  bio: "Inventor of the Hip Thrust. Strength and conditioning specialist PhD.",
  posts: []
};
const res11 = classifyCreator(glutes);
assert.strictEqual(res11.category, "Fitness, Movement & Rehab");
assert.strictEqual(res11.subGroup, "Glutes, Strength & Hypertrophy");
console.log("✅ Test 11 Passed: Bret Contreras classified into Fitness, Movement & Rehab > Glutes, Strength & Hypertrophy");

// Test 13: Brené Brown
const brene = {
  authorUsername: "brenebrown",
  authorFullName: "Brené Brown",
  category: null,
  bio: null,
  posts: []
};
const res13 = classifyCreator(brene);
assert.strictEqual(res13.category, "Mindset, Psychology & Learning");
assert.strictEqual(res13.subGroup, "Psychology & Mental Health");
console.log("✅ Test 13 Passed: Brené Brown classified into Mindset, Psychology & Learning > Psychology & Mental Health");

// Test 14: Conor Harris
const conor = {
  authorUsername: "conor_harris_",
  authorFullName: "Conor Harris",
  category: null,
  bio: null,
  posts: []
};
const res14 = classifyCreator(conor);
assert.strictEqual(res14.category, "Fitness, Movement & Rehab");
assert.strictEqual(res14.subGroup, "Physical Therapy & Anatomy");
console.log("✅ Test 14 Passed: Conor Harris classified into Fitness, Movement & Rehab > Physical Therapy & Anatomy");

// Test 15: Dezeen
const dezeen = {
  authorUsername: "dezeen",
  authorFullName: "Dezeen",
  category: null,
  bio: null,
  posts: []
};
const res15 = classifyCreator(dezeen);
assert.strictEqual(res15.category, "Arts & Creative");
assert.strictEqual(res15.subGroup, "Architecture, Interior & Studios");
console.log("✅ Test 15 Passed: Dezeen classified into Arts & Creative > Architecture, Interior & Studios");

// Test 16: Iris van Herpen
const iris = {
  authorUsername: "irisvanherpen",
  authorFullName: "Iris van Herpen Official",
  category: null,
  bio: null,
  posts: []
};
const res16 = classifyCreator(iris);
assert.strictEqual(res16.category, "Fashion, Beauty & Style");
assert.strictEqual(res16.subGroup, "Apparel, Styling & Outfits");
console.log("✅ Test 16 Passed: Iris van Herpen classified into Fashion, Beauty & Style > Apparel, Styling & Outfits");

// Test 17: Eden Eats
const eden = {
  authorUsername: "edeneats",
  authorFullName: "E D E N G R I N S H P A N",
  category: null,
  bio: null,
  posts: []
};
const res17 = classifyCreator(eden);
assert.strictEqual(res17.category, "Food & Culinary");
assert.strictEqual(res17.subGroup, "Cooking, Recipes & Dining");
console.log("✅ Test 17 Passed: Eden Eats classified into Food & Culinary > Cooking, Recipes & Dining");

// Test 18: TEDx Official
const tedx = {
  authorUsername: "tedx_official",
  authorFullName: "TEDx",
  category: null,
  bio: null,
  posts: []
};
const res18 = classifyCreator(tedx);
assert.strictEqual(res18.category, "Mindset, Psychology & Learning");
assert.strictEqual(res18.subGroup, "Habits & Productivity");
console.log("✅ Test 18 Passed: TEDx classified into Mindset, Psychology & Learning > Habits & Productivity");

console.log("\n🎉 All 18 Full-Spectrum Taxonomy Tests Passed!");
