"use server";

import type { FoodCategory } from "@/types/fitness";
import { extractGramsFromServing } from "@/lib/food-portion";

export interface AIEstimateInput {
  description: string;
  ingredients?: string;
  cookingMethod?: string;
  cookedPortionTotal?: string;
  portionEaten?: string;
}

export interface DetectedIngredient {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface AIEstimateResult {
  name: string;
  category: FoodCategory;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  explanation: string;
  detectedIngredients?: DetectedIngredient[];
  cookingAdjustments?: string;
  portionEatenRatio?: number;
  isAIEstimated: boolean;
}

// Built-in culinary nutrition database for deterministic recipe breakdown & offline/fallback AI estimation
const NUTRITION_BASE: Record<
  string,
  { calPer100g: number; p: number; c: number; f: number; fib: number; defaultCat: FoodCategory }
> = {
  chicken: { calPer100g: 165, p: 31, c: 0, f: 3.6, fib: 0, defaultCat: "curry_meat" },
  chickenbreast: { calPer100g: 165, p: 31, c: 0, f: 3.6, fib: 0, defaultCat: "curry_meat" },
  chickenthigh: { calPer100g: 209, p: 26, c: 0, f: 10.9, fib: 0, defaultCat: "curry_meat" },
  beef: { calPer100g: 250, p: 26, c: 0, f: 15, fib: 0, defaultCat: "curry_meat" },
  mutton: { calPer100g: 294, p: 25, c: 0, f: 21, fib: 0, defaultCat: "curry_meat" },
  goat: { calPer100g: 143, p: 27, c: 0, f: 3, fib: 0, defaultCat: "curry_meat" },
  fish: { calPer100g: 140, p: 22, c: 0, f: 5, fib: 0, defaultCat: "fish_seafood" },
  salmon: { calPer100g: 208, p: 20, c: 0, f: 13, fib: 0, defaultCat: "fish_seafood" },
  tuna: { calPer100g: 130, p: 28, c: 0, f: 1, fib: 0, defaultCat: "fish_seafood" },
  shrimp: { calPer100g: 99, p: 24, c: 0.2, f: 0.3, fib: 0, defaultCat: "fish_seafood" },
  prawn: { calPer100g: 105, p: 24, c: 0.5, f: 0.8, fib: 0, defaultCat: "fish_seafood" },
  hilsa: { calPer100g: 310, p: 21.8, c: 2.9, f: 24, fib: 0, defaultCat: "fish_seafood" },
  rui: { calPer100g: 128, p: 19.7, c: 4.4, f: 3.5, fib: 0, defaultCat: "fish_seafood" },
  tilapia: { calPer100g: 128, p: 26, c: 0, f: 2.7, fib: 0, defaultCat: "fish_seafood" },
  egg: { calPer100g: 143, p: 12.6, c: 0.7, f: 9.5, fib: 0, defaultCat: "dairy_eggs" }, // ~70 cal each (50g)
  eggwhite: { calPer100g: 52, p: 10.9, c: 0.7, f: 0.2, fib: 0, defaultCat: "dairy_eggs" },
  rice: { calPer100g: 130, p: 2.7, c: 28, f: 0.3, fib: 0.4, defaultCat: "rice_grains" }, // cooked
  rawrice: { calPer100g: 360, p: 7, c: 79, f: 0.6, fib: 1.3, defaultCat: "rice_grains" },
  brownrice: { calPer100g: 111, p: 2.6, c: 23, f: 0.9, fib: 1.8, defaultCat: "rice_grains" },
  basmati: { calPer100g: 121, p: 3.5, c: 25, f: 0.4, fib: 0.5, defaultCat: "rice_grains" },
  dal: { calPer100g: 116, p: 9, c: 20, f: 0.4, fib: 7.9, defaultCat: "curry_meat" }, // cooked lentils
  lentil: { calPer100g: 116, p: 9, c: 20, f: 0.4, fib: 7.9, defaultCat: "curry_meat" },
  chickpea: { calPer100g: 164, p: 8.9, c: 27.4, f: 2.6, fib: 7.6, defaultCat: "rice_grains" },
  potato: { calPer100g: 87, p: 1.9, c: 20.1, f: 0.1, fib: 1.8, defaultCat: "fruits_veg" },
  onion: { calPer100g: 40, p: 1.1, c: 9.3, f: 0.1, fib: 1.7, defaultCat: "fruits_veg" },
  tomato: { calPer100g: 18, p: 0.9, c: 3.9, f: 0.2, fib: 1.2, defaultCat: "fruits_veg" },
  garlic: { calPer100g: 149, p: 6.4, c: 33, f: 0.5, fib: 2.1, defaultCat: "fruits_veg" },
  ginger: { calPer100g: 80, p: 1.8, c: 17.8, f: 0.7, fib: 2, defaultCat: "fruits_veg" },
  spinach: { calPer100g: 23, p: 2.9, c: 3.6, f: 0.4, fib: 2.2, defaultCat: "fruits_veg" },
  broccoli: { calPer100g: 34, p: 2.8, c: 7, f: 0.4, fib: 2.6, defaultCat: "fruits_veg" },
  cauliflower: { calPer100g: 25, p: 1.9, c: 5, f: 0.3, fib: 2, defaultCat: "fruits_veg" },
  carrot: { calPer100g: 41, p: 0.9, c: 9.6, f: 0.2, fib: 2.8, defaultCat: "fruits_veg" },
  oil: { calPer100g: 884, p: 0, c: 0, f: 100, fib: 0, defaultCat: "custom" }, // 1 tbsp ~14g = 124 cal
  oliveoil: { calPer100g: 884, p: 0, c: 0, f: 100, fib: 0, defaultCat: "custom" },
  mustardoil: { calPer100g: 884, p: 0, c: 0, f: 100, fib: 0, defaultCat: "custom" },
  soybeanoil: { calPer100g: 884, p: 0, c: 0, f: 100, fib: 0, defaultCat: "custom" },
  ghee: { calPer100g: 900, p: 0, c: 0, f: 99.5, fib: 0, defaultCat: "dairy_eggs" },
  butter: { calPer100g: 717, p: 0.9, c: 0.1, f: 81, fib: 0, defaultCat: "dairy_eggs" },
  paneer: { calPer100g: 296, p: 18.3, c: 4.5, f: 22.5, fib: 0, defaultCat: "dairy_eggs" },
  cheese: { calPer100g: 402, p: 25, c: 1.3, f: 33, fib: 0, defaultCat: "dairy_eggs" },
  milk: { calPer100g: 61, p: 3.2, c: 4.8, f: 3.3, fib: 0, defaultCat: "dairy_eggs" },
  curd: { calPer100g: 98, p: 3.5, c: 4.7, f: 4.3, fib: 0, defaultCat: "dairy_eggs" },
  yogurt: { calPer100g: 61, p: 3.5, c: 4.7, f: 3.3, fib: 0, defaultCat: "dairy_eggs" },
  roti: { calPer100g: 264, p: 9, c: 55, f: 3.5, fib: 7, defaultCat: "bread_bakery" }, // 1 roti ~35g = 90 cal
  bread: { calPer100g: 265, p: 9, c: 49, f: 3.2, fib: 2.7, defaultCat: "bread_bakery" },
  oats: { calPer100g: 389, p: 16.9, c: 66.3, f: 6.9, fib: 10.6, defaultCat: "rice_grains" },
  flour: { calPer100g: 364, p: 10, c: 76, f: 1, fib: 2.7, defaultCat: "bread_bakery" },
  sugar: { calPer100g: 387, p: 0, c: 100, f: 0, fib: 0, defaultCat: "sweets_desserts" },
  whey: { calPer100g: 400, p: 80, c: 6.7, f: 5, fib: 0, defaultCat: "dairy_eggs" }, // ~1 scoop 30g = 120 cal, 24g P
  proteinpowder: { calPer100g: 400, p: 80, c: 6.7, f: 5, fib: 0, defaultCat: "dairy_eggs" },
  banana: { calPer100g: 89, p: 1.1, c: 22.8, f: 0.3, fib: 2.6, defaultCat: "fruits_veg" },
  peanutbutter: { calPer100g: 588, p: 25, c: 20, f: 50, fib: 6, defaultCat: "custom" },
  apple: { calPer100g: 52, p: 0.3, c: 14, f: 0.2, fib: 2.4, defaultCat: "fruits_veg" },
  pasta: { calPer100g: 158, p: 5.8, c: 31, f: 0.9, fib: 1.8, defaultCat: "rice_grains" },
  tofu: { calPer100g: 76, p: 8, c: 1.9, f: 4.8, fib: 0.3, defaultCat: "dairy_eggs" },
  kalabhuna: { calPer100g: 250, p: 18.5, c: 3.5, f: 18.5, fib: 0.5, defaultCat: "curry_meat" },
  bhuna: { calPer100g: 215, p: 17, c: 4, f: 15, fib: 0.5, defaultCat: "curry_meat" },
  kacchi: { calPer100g: 185, p: 8, c: 18, f: 9, fib: 0.5, defaultCat: "rice_grains" },
  biryani: { calPer100g: 175, p: 8, c: 19, f: 7.5, fib: 0.5, defaultCat: "rice_grains" },
  tehari: { calPer100g: 175, p: 6.5, c: 21, f: 7.5, fib: 0.5, defaultCat: "rice_grains" },
  polao: { calPer100g: 180, p: 3.6, c: 27, f: 6, fib: 0.5, defaultCat: "rice_grains" },
  khichuri: { calPer100g: 130, p: 4, c: 20, f: 3.5, fib: 1.5, defaultCat: "rice_grains" },
  bhorta: { calPer100g: 125, p: 2.5, c: 16, f: 6, fib: 2, defaultCat: "fruits_veg" },
  vaji: { calPer100g: 140, p: 2.5, c: 14, f: 8, fib: 2.5, defaultCat: "fruits_veg" },
  bhaji: { calPer100g: 140, p: 2.5, c: 14, f: 8, fib: 2.5, defaultCat: "fruits_veg" },
  paratha: { calPer100g: 330, p: 6, c: 45, f: 14, fib: 3, defaultCat: "bread_bakery" },
  singara: { calPer100g: 250, p: 5, c: 30, f: 13, fib: 2.5, defaultCat: "snacks_beverages" },
  fuchka: { calPer100g: 210, p: 4, c: 32, f: 7.5, fib: 2.5, defaultCat: "snacks_beverages" },
  chotpoti: { calPer100g: 124, p: 5.6, c: 19.2, f: 2.8, fib: 3.2, defaultCat: "snacks_beverages" },
};

/** Parse quantity and gram weight from ingredient snippet */
function parseIngredientSnippet(text: string): { name: string; grams: number; baseKey: string | null } {
  const lower = text.toLowerCase().trim();
  let grams = 100; // default assumption

  // Look for gram matches (e.g. 200g, 250 g, 500gm, 1kg)
  const kgMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?)/);
  const gMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams?)/);
  const tbspMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:tbsp|tablespoon|tbsps|tablespoons)/);
  const tspMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:tsp|teaspoon|tsps|teaspoons)/);
  const cupMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:cups?|katori|bowl)/);
  const scoopMatch = lower.match(/(\d+(?:\.\d+)?)\s*scoops?/);
  const pieceMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:pcs?|pieces?|slice|slices?|egg|eggs)/);

  if (kgMatch) {
    grams = parseFloat(kgMatch[1]) * 1000;
  } else if (gMatch) {
    grams = parseFloat(gMatch[1]);
  } else if (tbspMatch) {
    grams = parseFloat(tbspMatch[1]) * 14;
  } else if (tspMatch) {
    grams = parseFloat(tspMatch[1]) * 5;
  } else if (cupMatch) {
    grams = parseFloat(cupMatch[1]) * 150;
  } else if (scoopMatch) {
    grams = parseFloat(scoopMatch[1]) * 30;
  } else if (pieceMatch) {
    const count = parseFloat(pieceMatch[1]);
    if (lower.includes("egg")) grams = count * 50;
    else if (lower.includes("roti") || lower.includes("chapati")) grams = count * 35;
    else if (lower.includes("bread")) grams = count * 30;
    else if (lower.includes("banana")) grams = count * 118;
    else grams = count * 75;
  }

  // Find matching key in NUTRITION_BASE (longest match first)
  let matchedKey: string | null = null;
  const sortedKeys = Object.keys(NUTRITION_BASE).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  return { name: text, grams: Math.max(1, grams), baseKey: matchedKey };
}

/**
 * Extract explicit eaten weight in grams (e.g. "eaten portion 50g", "eaten poriton 50g", "ate 50g", "portion 50g", "50g eaten")
 */
function extractExplicitEatenGrams(text: string): number | null {
  if (!text) return null;
  const lower = text.toLowerCase();

  // Pattern 1: e.g. "eaten portion 50g", "eaten poriton 50g", "portion eaten: 50g", "eaten 50g", "ate 50g", "portion 50g", "had 50g", "eating 50g"
  const m1 = lower.match(
    /(?:eaten|eat|ate|eating|had|having|portion|poriton|serving|serving\s*size)\s*(?:portion|poriton|size|amount|weight)?\s*(?:is|was|of|:)?\s*(\d+(?:\.\d+)?)\s*(?:g|gm|grams?)\b/
  );
  if (m1) return parseFloat(m1[1]);

  // Pattern 2: e.g. "50g portion", "50g poriton", "50g eaten", "50g serving", "50g of it"
  const m2 = lower.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams?)\s*(?:portion|poriton|eaten|serving|of\s*it)/);
  if (m2) return parseFloat(m2[1]);

  // Pattern 3: e.g. "ate 50g" or "eaten 50g"
  const m3 = lower.match(/(?:ate|eaten|eat)\s*(\d+(?:\.\d+)?)\s*(?:g|gm|grams?)\b/);
  if (m3) return parseFloat(m3[1]);

  // Pattern 4: If text has only one single gram quantity and does NOT contain batch words, e.g. "50g chicken curry"
  const allGrams = [...lower.matchAll(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams?)\b/g)];
  if (allGrams.length === 1 && !/(?:batch|cooked|total|made|prepared)/.test(lower)) {
    return parseFloat(allGrams[0][1]);
  }

  return null;
}

/**
 * Extract explicit batch or total weight in grams (e.g. "cooked 500g", "total batch 500g", "made 500g", "total 500g")
 */
function extractExplicitBatchGrams(text: string): number | null {
  if (!text) return null;
  const lower = text.toLowerCase();

  const m1 = lower.match(
    /(?:cooked|made|total|batch|prepared|whole)\s*(?:total|batch|cooked|weight)?\s*(?:is|was|of|:)?\s*(\d+(?:\.\d+)?)\s*(?:g|gm|grams?)\b/
  );
  if (m1) return parseFloat(m1[1]);

  const m2 = lower.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams?)\s*(?:total|batch|cooked|prepared|in\s*total)/);
  if (m2) return parseFloat(m2[1]);

  return null;
}

/** Check if text line is purely describing portion or batch rather than an ingredient */
function isPortionClause(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    /(?:eaten|eat|ate|eating|had|portion|poriton|serving|serving\s*size|batch|total\s*batch|total\s*cooked)/.test(lower) &&
    /\d/.test(lower) &&
    !/(?:chicken|beef|mutton|goat|fish|salmon|tuna|shrimp|prawn|egg|rice|dal|lentil|chickpea|potato|onion|tomato|spinach|broccoli|carrot|oil|butter|ghee|cheese|paneer|milk|yogurt|bread|roti|oats|whey|banana|peanut|tofu|pasta)/.test(lower)
  );
}

/** Extract clean dish name from freeform description */
function extractDishName(text: string): string {
  if (!text) return "Homemade Custom Food";
  // Remove common leading phrases or instructions, and strip portion clauses
  let clean = text
    .replace(/^e\.g\.?\s*/i, "")
    .replace(/(?:i\s+)?(?:ate|eaten|had|eating)\s+\d+(?:\.\d+)?\s*(?:g|gm|grams?|servings?|portions?|bowls?|cups?)\b/gi, "")
    .replace(/(?:eaten|portion|poriton)\s*(?:portion|poriton|size|amount|weight)?\s*(?:is|was|of|:)?\s*\d+(?:\.\d+)?\s*(?:g|gm|grams?)\b/gi, "")
    .replace(/(?:cooked|made|total|batch)\s*(?:total|batch|cooked)?\s*(?:is|was|of|:)?\s*\d+(?:\.\d+)?\s*(?:g|gm|grams?|servings?|portions?)\b/gi, "")
    .replace(/\b(?:eaten|poriton|portion)\s+\d+(?:\.\d+)?\s*(?:g|gm|grams?)\b/gi, "")
    .trim();

  clean = clean.replace(/^(?:i\s+)?(?:ate|eaten|had|eating)\s+/i, "").trim();
  clean = clean.replace(/\s*\b\d+(?:\.\d+)?\s*(?:g|gm|grams?|kg)$/i, "").trim();

  // Pick the first clause before commas, semicolons or 'with'
  const firstClause = clean.split(/[,.;]|\bwith\b/)[0]?.trim() || "";
  if (firstClause.length >= 3 && firstClause.length <= 45) {
    const withoutNumbers = firstClause.replace(/^\d+\s*(?:g|gm|kg|tbsp|tsp|cups?|pcs?|pieces?)\s+/i, "");
    if (withoutNumbers.length >= 3) {
      return withoutNumbers
        .split(/\s+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
    }
  }

  if (clean.toLowerCase().includes("chicken")) return "Homemade Chicken Dish";
  if (clean.toLowerCase().includes("beef")) return "Homemade Beef Dish";
  if (clean.toLowerCase().includes("fish")) return "Homemade Fish Dish";
  if (clean.toLowerCase().includes("egg")) return "Homemade Egg Dish";
  if (clean.toLowerCase().includes("rice")) return "Rice Bowl with Sides";
  if (clean.toLowerCase().includes("dal")) return "Homemade Dal / Lentils";
  if (clean.toLowerCase().includes("shake")) return "Protein Shake";

  return clean.slice(0, 35) || "Homemade Custom Food";
}

/** Fallback deterministic nutrition calculator based on culinary rules */
function fallbackCalculateNutrition(input: AIEstimateInput): AIEstimateResult {
  const fullText = [
    input.description || "",
    input.ingredients || "",
    input.cookingMethod || "",
    input.cookedPortionTotal || "",
    input.portionEaten || "",
  ]
    .join(" ")
    .toLowerCase();

  const explicitEatenG = extractExplicitEatenGrams(fullText);
  const explicitBatchG = extractExplicitBatchGrams(fullText);

  // Parse cooking method adjustments - specialized for Bangladeshi & South Asian cooking (rich in oil & spices)
  let cookingExtraFat = 0; // extra grams of fat per batch
  let cookingAdjustmentNote = "Standard cooking.";
  const hasExplicitOilInText = fullText.includes("oil") || fullText.includes("ghee") || fullText.includes("butter");

  if (fullText.includes("deep fry") || fullText.includes("deep-fried") || fullText.includes("crispy fried") || fullText.includes("singara") || fullText.includes("piyaju") || fullText.includes("beguni")) {
    cookingExtraFat = hasExplicitOilInText ? 4 : 16;
    cookingAdjustmentNote = "Deep fried (Bangladeshi style): +16g oil absorption accounted for.";
  } else if (fullText.includes("kala bhuna") || fullText.includes("bhuna") || fullText.includes("koshano")) {
    cookingExtraFat = hasExplicitOilInText ? 4 : 16;
    cookingAdjustmentNote = "Traditional Bangladeshi Bhuna (braised in rich spiced oil/ghee): +16g cooking fat accounted for.";
  } else if (fullText.includes("kacchi") || fullText.includes("tehari") || fullText.includes("biryani") || fullText.includes("morog polao")) {
    cookingExtraFat = hasExplicitOilInText ? 4 : 18;
    cookingAdjustmentNote = "Rich Bangladeshi Biryani/Tehari (cooked in mustard oil/ghee): +18g fat accounted for.";
  } else if (fullText.includes("curry") || fullText.includes("jhol") || fullText.includes("torkari") || fullText.includes("rezala") || fullText.includes("korma")) {
    cookingExtraFat = hasExplicitOilInText ? 3 : 14;
    cookingAdjustmentNote = "Bangladeshi spiced curry/jhol gravy: +14g cooking oil accounted for.";
  } else if (fullText.includes("vaji") || fullText.includes("bhaji") || fullText.includes("pan fry") || fullText.includes("pan-fried") || fullText.includes("stir fry") || fullText.includes("sauté") || fullText.includes("saute")) {
    cookingExtraFat = hasExplicitOilInText ? 2 : 10;
    cookingAdjustmentNote = "Sautéed / Vaji (in spiced oil): +10g cooking fat accounted for.";
  } else if (fullText.includes("bhorta") || fullText.includes("vorta")) {
    cookingExtraFat = hasExplicitOilInText ? 2 : 6;
    cookingAdjustmentNote = "Bangladeshi Bhorta (finished with raw mustard oil): +6g mustard oil accounted for.";
  } else if (fullText.includes("boil") || fullText.includes("steam") || fullText.includes("steamed")) {
    cookingExtraFat = 0;
    cookingAdjustmentNote = "Boiled / Steamed: No extra cooking fat added.";
  } else if (fullText.includes("bake") || fullText.includes("baked") || fullText.includes("roast") || fullText.includes("grilled")) {
    cookingExtraFat = 4;
    cookingAdjustmentNote = "Baked / Grilled: +4g light coating oil.";
  } else if (fullText.includes("spicy") || fullText.includes("oily") || fullText.includes("bangladeshi") || fullText.includes("desi")) {
    cookingExtraFat = hasExplicitOilInText ? 3 : 12;
    cookingAdjustmentNote = "Traditional Bangladeshi oily/spicy preparation: +12g cooking fat accounted for.";
  }

  // Parse lines or comma / 'with' / 'and' separated ingredients
  const lines = (input.ingredients || input.description || "")
    .split(/[,;\n+]|\band\b|\bwith\b/)
    .map((s) => s.trim())
    .filter(Boolean);

  const detected: DetectedIngredient[] = [];
  let totalBatchCal = 0;
  let totalBatchP = 0;
  let totalBatchC = 0;
  let totalBatchF = cookingExtraFat;
  let totalBatchFib = 0;
  let totalBatchGrams = 0;
  let primaryCategory: FoodCategory = "custom";

  for (const line of lines) {
    if (isPortionClause(line)) continue;

    const parsed = parseIngredientSnippet(line);
    if (parsed.baseKey && NUTRITION_BASE[parsed.baseKey]) {
      const base = NUTRITION_BASE[parsed.baseKey];
      const factor = parsed.grams / 100;
      const cal = Math.round(base.calPer100g * factor);
      const p = Math.round(base.p * factor * 10) / 10;
      const c = Math.round(base.c * factor * 10) / 10;
      const f = Math.round(base.f * factor * 10) / 10;
      const fib = Math.round(base.fib * factor * 10) / 10;

      detected.push({
        name: parsed.name,
        amount: `${parsed.grams}g`,
        calories: cal,
        protein: p,
        carbs: c,
        fat: f,
        fiber: fib,
      });

      totalBatchCal += cal;
      totalBatchP += p;
      totalBatchC += c;
      totalBatchF += f;
      totalBatchFib += fib;
      totalBatchGrams += parsed.grams;
      if (primaryCategory === "custom" && base.defaultCat !== "custom") {
        primaryCategory = base.defaultCat;
      }
    }
  }

  // Determine portion ratio, eaten grams, and serving size accurately
  let portionRatio = 1.0;
  let portionText = "Full batch (100%)";
  let eatenGrams = 0;
  let servingSize = "1 portion";

  if (explicitEatenG !== null && explicitEatenG > 0) {
    eatenGrams = explicitEatenG;
    servingSize = `${explicitEatenG}g`;

    const effectiveBatchGrams =
      explicitBatchG && explicitBatchG > 0
        ? explicitBatchG
        : totalBatchGrams > explicitEatenG
          ? totalBatchGrams
          : explicitEatenG;

    if (effectiveBatchGrams > explicitEatenG) {
      portionRatio = explicitEatenG / effectiveBatchGrams;
      portionText = `${explicitEatenG}g portion (${Math.round(portionRatio * 100)}% of ${effectiveBatchGrams}g batch)`;
    } else {
      portionRatio = 1.0;
      portionText = `${explicitEatenG}g portion`;
    }
  } else {
    // Check for fraction or portion counts (e.g. "cooked 4 servings, ate 1", "1 of 4", "half", "quarter", "25%")
    const cookedAteMatch = fullText.match(
      /(?:cooked|made|total)\s*(\d+)\s*(?:servings?|portions?).*?(?:ate|eat|had)\s*(\d+)/
    );
    const fractionMatch = fullText.match(/(\d+)\s*(?:\/|out of|of)\s*(\d+)/);
    const percentMatch = fullText.match(/(\d+)\s*%/);
    const gramPortionMatch = fullText.match(/ate\s*(\d+)\s*g.*(?:of|total)\s*(\d+)\s*g/);

    if (cookedAteMatch) {
      const totalS = parseFloat(cookedAteMatch[1]);
      const ateS = parseFloat(cookedAteMatch[2]);
      if (totalS > 0 && ateS <= totalS) {
        portionRatio = ateS / totalS;
        portionText = `${ateS} of ${totalS} servings (${Math.round(portionRatio * 100)}%)`;
      }
    } else if (gramPortionMatch) {
      const eatenG = parseFloat(gramPortionMatch[1]);
      const totalG = parseFloat(gramPortionMatch[2]);
      if (totalG > 0 && eatenG <= totalG) {
        portionRatio = eatenG / totalG;
        eatenGrams = eatenG;
        servingSize = `${eatenG}g`;
        portionText = `${eatenG}g of ${totalG}g total (${Math.round(portionRatio * 100)}%)`;
      }
    } else if (fractionMatch) {
      const num = parseFloat(fractionMatch[1]);
      const den = parseFloat(fractionMatch[2]);
      if (den > 0 && num <= den) {
        portionRatio = num / den;
        portionText = `${num}/${den} portion (${Math.round(portionRatio * 100)}%)`;
      }
    } else if (percentMatch) {
      const p = parseFloat(percentMatch[1]);
      if (p > 0 && p <= 100) {
        portionRatio = p / 100;
        portionText = `${p}% portion`;
      }
    } else if (fullText.includes("half") || fullText.includes("1/2")) {
      portionRatio = 0.5;
      portionText = "Half portion (50%)";
    } else if (fullText.includes("quarter") || fullText.includes("1/4")) {
      portionRatio = 0.25;
      portionText = "Quarter portion (25%)";
    } else if (fullText.includes("one third") || fullText.includes("1/3")) {
      portionRatio = 0.33;
      portionText = "1/3rd portion (~33%)";
    }

    if (!eatenGrams) {
      eatenGrams = Math.round(totalBatchGrams * portionRatio);
      servingSize = eatenGrams > 0 ? `${eatenGrams}g` : `1 portion${portionRatio < 1 ? ` (${portionText})` : ""}`;
    }
  }

  // Calculate final nutrition values strictly for the eaten portion / serving size
  let finalCal = 0;
  let finalP = 0;
  let finalC = 0;
  let finalF = 0;
  let finalFib = 0;

  if (detected.length === 0) {
    // Standard wholesome home-cooked baseline (~160 kcal per 100g)
    const targetG = eatenGrams > 0 ? eatenGrams : 100;
    const factor = targetG / 100;
    finalCal = Math.max(10, Math.round((160 + cookingExtraFat * 9) * factor));
    finalP = Math.max(0, Math.round(14 * factor * 10) / 10);
    finalC = Math.max(0, Math.round(12 * factor * 10) / 10);
    finalF = Math.max(0, Math.round((6 + cookingExtraFat) * factor * 10) / 10);
    finalFib = Math.max(0, Math.round(1.5 * factor * 10) / 10);
  } else {
    totalBatchCal += Math.round(cookingExtraFat * 9);
    finalCal = Math.max(10, Math.round(totalBatchCal * portionRatio));
    finalP = Math.max(0, Math.round(totalBatchP * portionRatio * 10) / 10);
    finalC = Math.max(0, Math.round(totalBatchC * portionRatio * 10) / 10);
    finalF = Math.max(0, Math.round(totalBatchF * portionRatio * 10) / 10);
    finalFib = Math.max(0, Math.round(totalBatchFib * portionRatio * 10) / 10);
  }

  const dishName = extractDishName(input.description || "");

  return {
    name: dishName,
    category: primaryCategory,
    servingSize,
    calories: finalCal,
    protein: finalP,
    carbs: finalC,
    fat: finalF,
    fiber: finalFib,
    explanation: `Calculated from ${detected.length > 0 ? detected.length : "estimated"} ingredients & cooking method (${cookingAdjustmentNote}). Scaled strictly for ${servingSize} (${portionText}).`,
    detectedIngredients: detected,
    cookingAdjustments: cookingAdjustmentNote,
    portionEatenRatio: portionRatio,
    isAIEstimated: true,
  };
}

/** Call Gemini / LLM API if key is available, otherwise use culinary engine */
export async function estimateFoodNutritionWithAI(input: AIEstimateInput): Promise<AIEstimateResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    // If no API key configured, use deterministic culinary calculation engine
    return fallbackCalculateNutrition(input);
  }

  try {
    const systemPrompt = `You are an expert culinary nutritionist & macro calculation AI for a fitness application.
Your goal is to parse a home-cooked dish recipe or food description from a single free-form user description, and calculate precise nutritional values to fill required fields for the exact portion eaten.

User Food Description:
"${input.description || ""}"
${input.ingredients ? `- Additional ingredients note: "${input.ingredients}"` : ""}
${input.cookingMethod ? `- Cooking method: "${input.cookingMethod}"` : ""}
${input.cookedPortionTotal ? `- Batch cooked: "${input.cookedPortionTotal}"` : ""}
${input.portionEaten ? `- Portion eaten: "${input.portionEaten}"` : ""}

CRITICAL BANGLADESHI & SOUTH ASIAN CULINARY CONTEXT:
- Traditional Bangladeshi, Bengali, and South Asian dishes (Chicken Curry, Beef Bhuna, Kala Bhuna, Dim Bhuna, Macher Jhol, Kacchi Biryani, Tehari, Khichuri, Alu/Potol Vaji, Begun Bhorta, Paratha) are NATURALLY OILY AND SPICED.
- Spices (turmeric, red chili, cumin, coriander, garam masala, ginger, garlic) are fried and bloomed in generous amounts of mustard oil, soybean oil, or ghee ("koshano" cooking technique).
- Unless the user explicitly states a diet/zero-oil/boiled preparation, ALWAYS factor in authentic Bangladeshi cooking oil levels:
  * Bhuna / Kala Bhuna / Rezala / Korma: high oil/ghee (approx 16-24g fat per 150g-200g serving).
  * Curries / Jhol / Salan: medium-high oil (approx 14-20g fat per 200g serving).
  * Vaji / Bhaji: sautéed in generous oil (approx 8-12g fat per serving).
  * Biryani / Tehari / Polao: cooked in ghee/oil (approx 20-35g fat per serving).
  * Bhorta: finished with pungent raw mustard oil (approx 4-7g fat per serving).
- For 50g of cooked Bangladeshi meat curry/bhuna, expected calories are ~95-120 kcal, protein ~10-13g, fat ~5-7g.

CRITICAL ACCURACY & SERVING SIZE RULES:
1. "servingSize" FIELD:
   - MUST EXACTLY match the portion eaten!
   - If the user specifies an eaten weight in grams (e.g., "eaten portion 50g", "eaten poriton 50g", "ate 50g", "portion 50g", "50g"), the "servingSize" MUST BE CLEANLY FORMATTED AS THAT WEIGHT: e.g. "50g" (NOT "1 portion", NOT "approx 200g", NOT "1 serving").
   - If the user cooked a batch and ate a portion (e.g., "cooked 500g chicken curry, ate 50g"), "servingSize" MUST be "50g".
   - If piece-based (e.g. "2 eggs and 1 toast"), "servingSize" should be "2 eggs + 1 toast".

2. CALORIE & MACRO CALCULATIONS:
   - "calories", "protein", "carbs", "fat", "fiber" MUST BE STRICTLY CALCULATED FOR THE EXACT "servingSize" (PORTION EATEN).
   - If a batch was 500g total and the eaten portion was 50g, scale by 50/500 = 10%.
   - NEVER output batch totals if only a portion was eaten.

3. "category":
   - Best matching category from: 'rice_grains', 'curry_meat', 'fish_seafood', 'bread_bakery', 'dairy_eggs', 'fruits_veg', 'sweets_desserts', 'snacks_beverages', 'custom'.

Output strictly valid JSON with this exact schema (no markdown wrap, just raw JSON):
{
  "name": "Chicken Curry",
  "category": "curry_meat",
  "servingSize": "50g",
  "calories": 100,
  "protein": 11.5,
  "carbs": 2.5,
  "fat": 5.0,
  "fiber": 0.5,
  "explanation": "Calculated from 500g batch chicken curry cooked with spiced oil gravy. Scaled to exact eaten portion of 50g (10% of batch).",
  "cookingAdjustments": "Accounted for authentic Bangladeshi cooking oil & blooming spices across 50g portion.",
  "portionEatenRatio": 0.1,
  "detectedIngredients": [
    { "name": "Chicken breast", "amount": "500g (batch)", "calories": 660, "protein": 124, "carbs": 0, "fat": 14.4, "fiber": 0 },
    { "name": "Cooking oil & spices", "amount": "2 tbsp oil (batch)", "calories": 240, "protein": 0, "carbs": 2, "fat": 27, "fiber": 0 }
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn("Gemini API error, falling back to local nutrition engine:", await res.text());
      return fallbackCalculateNutrition(input);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return fallbackCalculateNutrition(input);
    }

    const parsed = JSON.parse(candidateText);

    // Post-process to guarantee exact serving size and calorie alignment
    const explicitGrams = extractExplicitEatenGrams(input.description || "");
    const explicitBatchGrams = extractExplicitBatchGrams(input.description || "");

    let finalServingSize = (parsed.servingSize || "1 portion").trim();
    let finalCal = Math.round(Number(parsed.calories) || 0);
    let finalP = Math.round((Number(parsed.protein) || 0) * 10) / 10;
    let finalC = Math.round((Number(parsed.carbs) || 0) * 10) / 10;
    let finalF = Math.round((Number(parsed.fat) || 0) * 10) / 10;
    let finalFib = Math.round((Number(parsed.fiber) || 0) * 10) / 10;
    let finalRatio = Number(parsed.portionEatenRatio) || 1;

    // Standardize gram-based serving size (e.g. "50 g" -> "50g")
    const gramInfo = extractGramsFromServing(finalServingSize);

    if (explicitGrams && explicitGrams > 0) {
      finalServingSize = `${explicitGrams}g`;

      // Safeguard: Check if LLM mistakenly returned whole-batch values for a small eaten portion
      if (explicitBatchGrams && explicitBatchGrams > explicitGrams) {
        finalRatio = explicitGrams / explicitBatchGrams;
        const maxExpectedCal = explicitGrams * 4.5;
        if (finalCal > maxExpectedCal && finalCal > 160) {
          finalCal = Math.max(10, Math.round(finalCal * finalRatio));
          finalP = Math.max(0, Math.round(finalP * finalRatio * 10) / 10);
          finalC = Math.max(0, Math.round(finalC * finalRatio * 10) / 10);
          finalF = Math.max(0, Math.round(finalF * finalRatio * 10) / 10);
          finalFib = Math.max(0, Math.round(finalFib * finalRatio * 10) / 10);
        }
      }
    } else if (gramInfo.hasGrams && gramInfo.grams > 0) {
      finalServingSize = `${gramInfo.grams}g`;
    }

    return {
      name: parsed.name || "Custom Cooked Food",
      category: parsed.category || "custom",
      servingSize: finalServingSize,
      calories: finalCal,
      protein: finalP,
      carbs: finalC,
      fat: finalF,
      fiber: finalFib,
      explanation: parsed.explanation || "Calculated with AI recipe analysis",
      detectedIngredients: parsed.detectedIngredients || [],
      cookingAdjustments: parsed.cookingAdjustments || "",
      portionEatenRatio: finalRatio,
      isAIEstimated: true,
    };
  } catch (err) {
    console.error("AI estimation error:", err);
    return fallbackCalculateNutrition(input);
  }
}
