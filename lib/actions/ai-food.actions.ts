"use server";

import type { FoodCategory } from "@/types/fitness";

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

/** Extract clean dish name from freeform description */
function extractDishName(text: string): string {
  if (!text) return "Homemade Custom Food";
  // Remove common leading phrases or instructions
  const stripped = text
    .replace(/^e\.g\.?\s*/i, "")
    .replace(/(?:cooked|made|total)\s*\d+.*$/i, "")
    .replace(/(?:i ate|ate|portion).*$/i, "")
    .trim();

  // Pick the first clause
  const firstClause = stripped.split(/[,.;]/)[0]?.trim() || "";
  if (firstClause.length >= 3 && firstClause.length <= 45) {
    // Title case and clean numbers from start
    const clean = firstClause.replace(/^\d+\s*(?:g|gm|kg|tbsp|tsp|cups?|pcs?|pieces?)\s+/i, "");
    return clean
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  if (stripped.toLowerCase().includes("chicken")) return "Homemade Chicken Dish";
  if (stripped.toLowerCase().includes("beef")) return "Homemade Beef Dish";
  if (stripped.toLowerCase().includes("fish")) return "Homemade Fish Dish";
  if (stripped.toLowerCase().includes("egg")) return "Homemade Egg Dish";
  if (stripped.toLowerCase().includes("rice")) return "Rice Bowl with Sides";
  if (stripped.toLowerCase().includes("dal")) return "Homemade Dal / Lentils";
  if (stripped.toLowerCase().includes("shake")) return "Protein Shake";

  return stripped.slice(0, 35) || "Homemade Custom Food";
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

  // Extract portion ratio (e.g. "cooked 4 servings, ate 1", "ate 1 of 4", "ate 20g out of 100g", "ate 150g of 600g", "half", "quarter", "1/2", "1/4")
  let portionRatio = 1.0;
  let portionText = "Full batch (100%)";

  const cookedAteMatch = fullText.match(/(?:cooked|made|total)\s*(\d+)\s*(?:servings?|portions?).*?(?:ate|eat|had)\s*(\d+)/);
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

  // Parse cooking method adjustments
  let cookingExtraFat = 0; // extra grams of fat per batch
  let cookingAdjustmentNote = "Standard cooking.";
  if (fullText.includes("deep fry") || fullText.includes("deep-fried") || fullText.includes("crispy fried")) {
    cookingExtraFat = 14; // absorbs ~1 tbsp oil
    cookingAdjustmentNote = "Deep frying: Added +14g oil/fat absorption.";
  } else if (
    fullText.includes("pan fry") ||
    fullText.includes("pan-fried") ||
    fullText.includes("stir fry") ||
    fullText.includes("sauté") ||
    fullText.includes("saute")
  ) {
    cookingExtraFat = 6;
    cookingAdjustmentNote = "Pan/Stir fry: Added +6g cooking fat.";
  } else if (fullText.includes("boil") || fullText.includes("steam") || fullText.includes("steamed")) {
    cookingExtraFat = 0;
    cookingAdjustmentNote = "Boiled / Steamed: No extra cooking fat added.";
  } else if (fullText.includes("bake") || fullText.includes("baked") || fullText.includes("roast") || fullText.includes("grilled")) {
    cookingExtraFat = 3;
    cookingAdjustmentNote = "Baked / Grilled: Added +3g light coating oil.";
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

  // If no ingredients matched from keyword dictionary, perform smart baseline heuristic
  if (detected.length === 0) {
    totalBatchCal = 380;
    totalBatchP = 22;
    totalBatchC = 35;
    totalBatchF = 12 + cookingExtraFat;
    totalBatchFib = 4;
    totalBatchGrams = 300;
  } else {
    totalBatchCal += Math.round(cookingExtraFat * 9);
  }

  // Calculate final values for the portion eaten
  const finalCal = Math.max(10, Math.round(totalBatchCal * portionRatio));
  const finalP = Math.max(0, Math.round(totalBatchP * portionRatio * 10) / 10);
  const finalC = Math.max(0, Math.round(totalBatchC * portionRatio * 10) / 10);
  const finalF = Math.max(0, Math.round(totalBatchF * portionRatio * 10) / 10);
  const finalFib = Math.max(0, Math.round(totalBatchFib * portionRatio * 10) / 10);
  const eatenGrams = Math.round(totalBatchGrams * portionRatio);

  const dishName = extractDishName(input.description || "");

  return {
    name: dishName,
    category: primaryCategory,
    servingSize: eatenGrams > 0 ? `${eatenGrams}g` : `1 portion${portionRatio < 1 ? ` (${portionText})` : ""}`,
    calories: finalCal,
    protein: finalP,
    carbs: finalC,
    fat: finalF,
    fiber: finalFib,
    explanation: `Calculated from ${detected.length > 0 ? detected.length : "estimated"} ingredients & cooking method (${cookingAdjustmentNote}). Portion eaten: ${portionText}.`,
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

Instructions:
1. Parse everything directly from the user's description. The user provides ingredients, weights, cooking method, batch size, and portion eaten all within this single input field.
2. Extract or infer:
   - "name": Clean, concise, appetizing food/dish name (e.g., "Homemade Chicken Curry", "2 Fried Eggs with Toast", "Beef Bhuna & Rice", "Oats & Whey Bowl").
   - "category": Best matching category from: 'rice_grains', 'curry_meat', 'fish_seafood', 'bread_bakery', 'dairy_eggs', 'fruits_veg', 'sweets_desserts', 'snacks_beverages', 'custom'.
   - "servingSize": Concise serving size string for the portion eaten (e.g., "1 portion (approx 250g)", "1 bowl (150g)", "2 eggs + 2 toasts").
   - Raw ingredients and measurements (grams, tbsp, cups, pieces), and their respective calories & macros.
   - Cooking method & added oil/fat:
     * Deep frying: add 10-15g oil absorption per serving unless already counted.
     * Pan/stir fry: add 4-7g cooking oil/butter unless already counted.
     * Boiled / steamed: 0g extra oil.
     * Curries / gravies: account for stated oil/ghee (typically 1-2 tbsp across the batch).
   - Portion eaten scaling:
     * If user states a cooked batch and portion eaten (e.g., "cooked 4 portions, ate 1", "made 500g, ate 150g", "ate half"), scale calories, protein, carbs, fat, and fiber by that exact ratio.
     * If user simply lists what they ate (e.g., "2 boiled eggs with 1 banana and a glass of milk"), portion eaten ratio is 1.0 (100%).
3. Calculate final total calories (kcal), protein (g), carbs (g), fat (g), fiber (g) for the EXACT portion eaten.

Output strictly valid JSON with this exact schema (no markdown wrap, just raw JSON):
{
  "name": "Clean concise dish name",
  "category": "curry_meat",
  "servingSize": "1 portion (approx 200g)",
  "calories": 320,
  "protein": 28.5,
  "carbs": 14.0,
  "fat": 9.0,
  "fiber": 2.5,
  "explanation": "Calculated from 200g chicken breast, 1 potato, 1 tbsp oil. Scaled to 1 of 4 portions (25%).",
  "cookingAdjustments": "Accounted for 1 tbsp pan-fry oil absorption across portion.",
  "portionEatenRatio": 0.25,
  "detectedIngredients": [
    { "name": "Chicken breast", "amount": "200g", "calories": 330, "protein": 62, "carbs": 0, "fat": 7.2, "fiber": 0 }
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
    return {
      name: parsed.name || "Custom Cooked Food",
      category: parsed.category || "custom",
      servingSize: parsed.servingSize || "1 portion",
      calories: Math.round(Number(parsed.calories) || 0),
      protein: Math.round((Number(parsed.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(parsed.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(parsed.fat) || 0) * 10) / 10,
      fiber: Math.round((Number(parsed.fiber) || 0) * 10) / 10,
      explanation: parsed.explanation || "Calculated with AI recipe analysis",
      detectedIngredients: parsed.detectedIngredients || [],
      cookingAdjustments: parsed.cookingAdjustments || "",
      portionEatenRatio: Number(parsed.portionEatenRatio) || 1,
      isAIEstimated: true,
    };
  } catch (err) {
    console.error("AI estimation error:", err);
    return fallbackCalculateNutrition(input);
  }
}
