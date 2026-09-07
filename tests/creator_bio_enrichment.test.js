import assert from 'node:assert';

console.log("🧪 Testing Creator Profile Bio & Category Extraction Engine...\n");

// Simulated taxonomy
const TAXONOMY = {
  "Fitness & Movement": {
    "Physical Therapy & Rehab": ["physical therapist", "physiotherapist", "physiotherapy", "rehab", "mobility", "posture"],
    "Pilates & Posture": ["pilates", "reformer", "mat pilates", "classical pilates", "lagree"],
    "Core & Abs": ["abs", "abdominal", "core", "sixpack", "core workout", "ab workout"],
    "CrossFit & Strength": ["crossfit", "strength", "powerlifting", "bodybuilding", "hypertrophy", "trainer"]
  },
  "Medicine & Wellness": {
    "Dermatology & Skincare": ["dermatologist", "dermatology", "skincare", "skin", "acne", "esthetician", "retinol"],
    "Doctors & Specialists": ["doctor", "physician", "md", "do", "surgeon", "neurologist", "cardiologist"],
    "Nutrition & Dietetics": ["dietitian", "nutritionist", "nutrition", "diet", "gut health", "rd"]
  }
};

function classifyCreator(creator) {
  const handle = (creator.authorUsername || "").toLowerCase();
  const fullName = (creator.authorFullName || "").toLowerCase();
  const officialCategory = (creator.category || "").toLowerCase();
  const bio = (creator.bio || "").toLowerCase();

  let bestCategory = "General & Lifestyle";
  let bestSubGroup = "Creators";
  let highestScore = 0;

  for (const [category, subGroups] of Object.entries(TAXONOMY)) {
    for (const [subGroup, keywords] of Object.entries(subGroups)) {
      let score = 0;
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(officialCategory)) score += 14;
        if (regex.test(bio)) score += 8;
        if (regex.test(handle)) score += 4;
        if (regex.test(fullName)) score += 4;
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
    subGroup: highestScore > 0 ? bestSubGroup : "Creators"
  };
}

// Case 1: Creator followed without saved posts, but synced with Bio
const followedPilatesCoach = {
  authorUsername: "sarah_movement",
  authorFullName: "Sarah Jenkins", // Plain name
  category: "Fitness Trainer",
  bio: "Certified Classical Pilates & Reformer Instructor • Spine & Posture Specialist"
};

const res1 = classifyCreator(followedPilatesCoach);
assert.strictEqual(res1.category, "Fitness & Movement");
assert.strictEqual(res1.subGroup, "Pilates & Posture");
console.log("✅ Test 1 Passed: Followed creator classified as Pilates & Posture via Bio keyword matching.");

// Case 2: Followed Dermatologist with non-descriptive username
const followedDermatologist = {
  authorUsername: "alex_glow",
  authorFullName: "Alex Vance",
  category: "Medical & Health",
  bio: "Board-Certified Dermatologist (MD) • Evidence-based Skincare & Acne treatment"
};

const res2 = classifyCreator(followedDermatologist);
assert.strictEqual(res2.category, "Medicine & Wellness");
assert.strictEqual(res2.subGroup, "Dermatology & Skincare");
console.log("✅ Test 2 Passed: Followed doctor classified as Dermatology & Skincare via Bio & Category.");

console.log("\n🎉 All Creator Bio Tests Passed!");
