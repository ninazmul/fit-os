/**
 * Food portion calculation helpers
 * Enables dual-mode quantity calculations:
 * 1. Multiplier mode (e.g. 0.5x, 1x, 2x servings)
 * 2. Grams/Weight portion mode (e.g. Base: 100g, Eaten: 20g -> 0.20x multiplier)
 */

export interface PortionBreakdown {
  baseGrams: number;
  hasGramUnit: boolean;
  calculatedQuantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  portionLabel: string;
}

/** Extract gram amount from a serving size string (e.g. "100g", "1 plate (250g)", "50 g") */
export function extractGramsFromServing(servingSize: string): { grams: number; hasGrams: boolean } {
  if (!servingSize) return { grams: 100, hasGrams: false };

  const clean = servingSize.toLowerCase();

  // Check for kg (e.g. 1kg, 0.5 kg)
  const kgMatch = clean.match(/(\d+(?:\.\d+)?)\s*kg/);
  if (kgMatch) {
    return { grams: parseFloat(kgMatch[1]) * 1000, hasGrams: true };
  }

  // Check for grams (e.g. 100g, 250 g, 100gm, 100 grams)
  const gMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:g|gm|grams?)\b/);
  if (gMatch) {
    return { grams: parseFloat(gMatch[1]), hasGrams: true };
  }

  // Check for ml (e.g. 250ml, 100 ml)
  const mlMatch = clean.match(/(\d+(?:\.\d+)?)\s*ml\b/);
  if (mlMatch) {
    return { grams: parseFloat(mlMatch[1]), hasGrams: true };
  }

  // If numeric with no unit, or generic serving like "1 serving", default to 100g
  return { grams: 100, hasGrams: false };
}

/** Calculate scaled nutrition based on eaten grams vs base serving */
export function calculateNutritionByGrams({
  baseServingSize,
  baseCalories,
  baseProtein,
  baseCarbs,
  baseFat,
  baseFiber = 0,
  eatenGrams,
}: {
  baseServingSize: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  baseFiber?: number;
  eatenGrams: number;
}): PortionBreakdown {
  const { grams: baseGrams, hasGrams } = extractGramsFromServing(baseServingSize);
  const safeBaseGrams = baseGrams > 0 ? baseGrams : 100;
  const safeEatenGrams = Math.max(0, eatenGrams || 0);

  const ratio = safeEatenGrams / safeBaseGrams;

  const calories = Math.round(baseCalories * ratio);
  const protein = Math.round(baseProtein * ratio * 10) / 10;
  const carbs = Math.round(baseCarbs * ratio * 10) / 10;
  const fat = Math.round(baseFat * ratio * 10) / 10;
  const fiber = Math.round(baseFiber * ratio * 10) / 10;

  const portionLabel = `${safeEatenGrams}g (${Math.round(ratio * 100)}% of ${baseServingSize})`;

  return {
    baseGrams: safeBaseGrams,
    hasGramUnit: hasGrams,
    calculatedQuantity: Math.round(ratio * 1000) / 1000,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    portionLabel,
  };
}

/** Calculate scaled nutrition based on multiplier quantity */
export function calculateNutritionByMultiplier({
  baseServingSize,
  baseCalories,
  baseProtein,
  baseCarbs,
  baseFat,
  baseFiber = 0,
  quantity,
}: {
  baseServingSize: string;
  baseCalories: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  baseFiber?: number;
  quantity: number;
}): PortionBreakdown {
  const { grams: baseGrams, hasGrams } = extractGramsFromServing(baseServingSize);
  const safeQty = Math.max(0, quantity || 0);

  const calories = Math.round(baseCalories * safeQty);
  const protein = Math.round(baseProtein * safeQty * 10) / 10;
  const carbs = Math.round(baseCarbs * safeQty * 10) / 10;
  const fat = Math.round(baseFat * safeQty * 10) / 10;
  const fiber = Math.round(baseFiber * safeQty * 10) / 10;

  const totalGrams = Math.round(baseGrams * safeQty);
  const portionLabel = hasGrams
    ? `${totalGrams}g (${safeQty} &times; ${baseServingSize})`
    : `${safeQty} &times; ${baseServingSize}`;

  return {
    baseGrams,
    hasGramUnit: hasGrams,
    calculatedQuantity: safeQty,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    portionLabel,
  };
}
