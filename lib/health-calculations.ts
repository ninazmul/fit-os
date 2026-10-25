import type { Gender } from "@/types/fitness";

export function calcBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi: number): {
  label: string;
  color: string;
  description: string;
} {
  if (bmi < 18.5)
    return {
      label: "Underweight",
      color: "text-blue-600 dark:text-blue-400",
      description:
        "Below healthy range. Consider a nutrition plan to gain weight safely.",
    };
  if (bmi < 25)
    return {
      label: "Healthy",
      color: "text-emerald-600 dark:text-emerald-400",
      description:
        "You're in the healthy weight range. Keep up the great work!",
    };
  if (bmi < 30)
    return {
      label: "Overweight",
      color: "text-amber-600 dark:text-amber-400",
      description:
        "Slightly above healthy range. Small lifestyle changes can make a big difference.",
    };
  if (bmi < 35)
    return {
      label: "Obese (Class I)",
      color: "text-orange-600 dark:text-orange-400",
      description:
        "Moderate obesity. Consult a healthcare provider for a personalized plan.",
    };
  if (bmi < 40)
    return {
      label: "Obese (Class II)",
      color: "text-red-600 dark:text-red-400",
      description: "Severe obesity. Consider consulting a healthcare provider.",
    };
  return {
    label: "Obese (Class III)",
    color: "text-red-700 dark:text-red-500",
    description:
      "Very severe obesity. Medical consultation is highly recommended.",
  };
}

export function calcIdealWeightRange(
  heightCm: number,
  gender?: Gender,
): { min: number; max: number } {
  const heightM = heightCm / 100;
  // Standard healthy BMI range (18.5 - 24.9)
  const minBmi = gender === "female" ? 18.5 : 18.5;
  const maxBmi = gender === "male" ? 24.9 : 24.9;
  const min = Math.round(minBmi * heightM * heightM * 10) / 10;
  const max = Math.round(maxBmi * heightM * heightM * 10) / 10;
  return { min, max };
}

export function calcBodyFatPercentage(params: {
  gender: Gender;
  heightCm: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
}): number | null {
  const { gender, heightCm, waistCm, neckCm, hipCm } = params;
  if (!waistCm || !neckCm || heightCm <= 0) return null;

  if (gender === "male") {
    if (waistCm - neckCm <= 0) return null;
    const bodyFat =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waistCm - neckCm) +
          0.15456 * Math.log10(heightCm)) -
      450;
    return Math.max(0, Math.min(60, Math.round(bodyFat * 10) / 10));
  } else {
    if (!hipCm) return null;
    if (waistCm + hipCm - neckCm <= 0) return null;
    const bodyFat =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waistCm + hipCm - neckCm) +
          0.221 * Math.log10(heightCm)) -
      450;
    return Math.max(0, Math.min(60, Math.round(bodyFat * 10) / 10));
  }
}

export function getBodyFatCategory(
  bodyFat: number,
  gender: Gender,
): { label: string; color: string } {
  if (gender === "male") {
    if (bodyFat < 6) return { label: "Essential", color: "text-blue-500" };
    if (bodyFat < 14) return { label: "Athletes", color: "text-cyan-500" };
    if (bodyFat < 18) return { label: "Fitness", color: "text-emerald-500" };
    if (bodyFat < 25) return { label: "Acceptable", color: "text-emerald-400" };
    return { label: "Obese", color: "text-amber-500" };
  } else {
    if (bodyFat < 14) return { label: "Essential", color: "text-blue-500" };
    if (bodyFat < 21) return { label: "Athletes", color: "text-cyan-500" };
    if (bodyFat < 25) return { label: "Fitness", color: "text-emerald-500" };
    if (bodyFat < 32) return { label: "Acceptable", color: "text-emerald-400" };
    return { label: "Obese", color: "text-amber-500" };
  }
}

export function calcWaistToHipRatio(
  waistCm?: number,
  hipCm?: number,
): number | null {
  if (!waistCm || !hipCm || hipCm <= 0) return null;
  return Math.round((waistCm / hipCm) * 100) / 100;
}

export function getWHRRiskCategory(
  whr: number,
  gender: Gender,
): { label: string; color: string; risk: string } {
  const disclaimer =
    "Screening estimate from waist ratio, not a clinical diagnosis. ";
  if (gender === "male") {
    if (whr < 0.9)
      return {
        label: "Low Risk",
        color: "text-emerald-600 dark:text-emerald-400",
        risk: `${disclaimer}Waist-to-hip ratio indicates low visceral fat accumulation risk. Keep up your active lifestyle!`,
      };
    if (whr < 1.0)
      return {
        label: "Moderate Risk",
        color: "text-amber-600 dark:text-amber-400",
        risk: `${disclaimer}Elevated waist-to-hip ratio indicates increased visceral fat risk. Spot reduction is not possible—focus on a sustained calorie deficit, aerobic activity, and resistance training.`,
      };
    return {
      label: "High Risk",
      color: "text-red-600 dark:text-red-400",
      risk: `${disclaimer}Higher visceral fat screening estimate. Prioritize a moderate calorie deficit, aerobic conditioning, progressive strength training, and consult a healthcare provider.`,
    };
  } else {
    if (whr < 0.8)
      return {
        label: "Low Risk",
        color: "text-emerald-600 dark:text-emerald-400",
        risk: `${disclaimer}Waist-to-hip ratio indicates low visceral fat accumulation risk. Keep up your active lifestyle!`,
      };
    if (whr < 0.85)
      return {
        label: "Moderate Risk",
        color: "text-amber-600 dark:text-amber-400",
        risk: `${disclaimer}Elevated waist-to-hip ratio indicates increased visceral fat risk. Spot reduction is not possible—focus on a sustained calorie deficit, aerobic activity, and resistance training.`,
      };
    return {
      label: "High Risk",
      color: "text-red-600 dark:text-red-400",
      risk: `${disclaimer}Higher visceral fat screening estimate. Prioritize a moderate calorie deficit, aerobic conditioning, progressive strength training, and consult a healthcare provider.`,
    };
  }
}

export function calcWaistToHeightRatio(
  waistCm?: number,
  heightCm?: number,
): number | null {
  if (!waistCm || !heightCm || heightCm <= 0) return null;
  return Math.round((waistCm / heightCm) * 100) / 100;
}

export function getWHtRCategory(whtr: number): {
  label: string;
  color: string;
  description: string;
} {
  if (whtr < 0.4)
    return {
      label: "Underweight",
      color: "text-blue-500",
      description: "Very slim build. May indicate insufficient weight.",
    };
  if (whtr < 0.5)
    return {
      label: "Healthy",
      color: "text-emerald-600 dark:text-emerald-400",
      description: "Healthy waist-to-height ratio. Excellent body composition.",
    };
  if (whtr < 0.6)
    return {
      label: "Overweight",
      color: "text-amber-600 dark:text-amber-400",
      description:
        "Increased health risk. Reduce waist circumference through a sustainable calorie deficit and regular activity.",
    };
  return {
    label: "High Risk",
    color: "text-red-600 dark:text-red-400",
    description:
      "Significantly elevated health risk. Medical check recommended.",
  };
}

export function calcLeanBodyMass(
  weightKg: number,
  bodyFatPct: number | null,
): number | null {
  if (bodyFatPct === null) return null;
  return Math.round(weightKg * (1 - bodyFatPct / 100) * 10) / 10;
}

export function calcFatMass(
  weightKg: number,
  bodyFatPct: number | null,
): number | null {
  if (bodyFatPct === null) return null;
  return Math.round(weightKg * (bodyFatPct / 100) * 10) / 10;
}

/** Body fat range (±3.5%) and accuracy note for US Navy method */
export function getBodyFatRange(bodyFatPct: number | null): {
  min: number;
  max: number;
  formattedRange: string;
  note: string;
} | null {
  if (bodyFatPct === null) return null;
  const margin = 3.5;
  const min = Math.max(3, Math.round((bodyFatPct - margin) * 10) / 10);
  const max = Math.round((bodyFatPct + margin) * 10) / 10;
  return {
    min,
    max,
    formattedRange: `${min}% – ${max}%`,
    note: "US Navy circumference estimate (accuracy within ±3–4% of DEXA). Hydration, food intake, and tape placement cause day-to-day fluctuations.",
  };
}

/** Standardized weight journey progress calculator */
export function calcWeightProgress(
  startWeight: number,
  currentWeight: number,
  targetWeight: number,
): {
  progressPct: number;
  remainingKg: number;
  isGain: boolean;
  atTarget: boolean;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
} {
  const atTarget = Math.abs(currentWeight - targetWeight) < 0.1;
  const isGain = targetWeight > startWeight;
  const remainingKg = Math.max(
    0,
    Math.round(Math.abs(currentWeight - targetWeight) * 10) / 10,
  );

  if (atTarget) {
    return {
      progressPct: 100,
      remainingKg: 0,
      isGain,
      atTarget: true,
      startWeight,
      currentWeight,
      targetWeight,
    };
  }

  let progress = 0;
  const totalChange = isGain
    ? targetWeight - startWeight
    : startWeight - targetWeight;
  const currentChange = isGain
    ? currentWeight - startWeight
    : startWeight - currentWeight;

  if (totalChange > 0) {
    progress = Math.round((currentChange / totalChange) * 100);
  }

  const progressPct = Math.max(0, Math.min(100, progress));

  return {
    progressPct,
    remainingKg,
    isGain,
    atTarget: false,
    startWeight,
    currentWeight,
    targetWeight,
  };
}

/** Mifflin-St Jeor BMR calculator */
export function calcBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  gender: Gender | string,
): number {
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (gender === "male") {
    bmr += 5;
  } else if (gender === "female") {
    bmr -= 161;
  } else {
    bmr -= 78;
  }
  return Math.round(bmr);
}

export const ACTIVITY_MULTIPLIERS: Record<
  string,
  { multiplier: number; label: string; daysSuggested: string }
> = {
  sedentary: {
    multiplier: 1.2,
    label: "Sedentary (Little/no exercise)",
    daysSuggested: "0 days/week",
  },
  light: {
    multiplier: 1.375,
    label: "Light (1-2 days/week)",
    daysSuggested: "1-2 days/week",
  },
  moderate: {
    multiplier: 1.55,
    label: "Moderate (3-5 days/week)",
    daysSuggested: "3-5 days/week",
  },
  active: {
    multiplier: 1.725,
    label: "Active (6-7 days/week)",
    daysSuggested: "6-7 days/week",
  },
  very_active: {
    multiplier: 1.9,
    label: "Very Active (Athlete/physical job)",
    daysSuggested: "Athletic training",
  },
};

export function calcTDEE(bmr: number, activityLevel: string): number {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel]?.multiplier || 1.55;
  return Math.round(bmr * mult);
}

export function autoSuggestActivityLevel(
  workoutDaysPerWeek: number,
): "sedentary" | "light" | "moderate" | "active" | "very_active" {
  if (workoutDaysPerWeek <= 0) return "sedentary";
  if (workoutDaysPerWeek <= 2) return "light";
  if (workoutDaysPerWeek <= 5) return "moderate";
  return "active";
}

/** Protein recommendation: default 1.4 g/kg for fat loss, user-editable 1.2-2.0 */
export function calcRecommendedProtein(params: {
  weightKg: number;
  goal: "lose_weight" | "gain_muscle" | "maintain" | string;
  activityLevel?: string;
  proteinRatioOverride?: number;
  customProteinGrams?: number;
}): {
  grams: number;
  ratioUsed: number;
  isCustom: boolean;
} {
  const {
    weightKg,
    goal,
    activityLevel,
    proteinRatioOverride,
    customProteinGrams,
  } = params;

  if (typeof customProteinGrams === "number" && customProteinGrams > 0) {
    const ratio = Math.round((customProteinGrams / weightKg) * 10) / 10;
    return { grams: customProteinGrams, ratioUsed: ratio, isCustom: true };
  }

  let ratio = 1.4;
  if (typeof proteinRatioOverride === "number" && proteinRatioOverride >= 1.0) {
    ratio = Math.max(1.2, Math.min(2.0, proteinRatioOverride));
  } else if (goal === "lose_weight") {
    ratio = 1.4; // 1.4 g/kg default for fat loss without overload
  } else if (goal === "gain_muscle") {
    ratio =
      activityLevel === "active" || activityLevel === "very_active"
        ? 1.8
        : 1.6;
  } else {
    ratio =
      activityLevel === "active" || activityLevel === "very_active"
        ? 1.4
        : 1.2;
  }

  const grams = Math.round(weightKg * ratio);
  return { grams, ratioUsed: ratio, isCustom: false };
}

export interface CalorieAdjustmentSuggestion {
  isEligible: boolean;
  reason?: string;
  daysLogged: number;
  weighInCount: number;
  weeklyRateKg: number;
  avgDailyIntakeKcal?: number;
  targetCalories: number;
  status:
    | "insufficient_data"
    | "healthy_rate"
    | "slow_or_underlogged"
    | "too_fast";
  badge: { label: string; color: string };
  recommendation: string;
  adjustmentKcal: number;
}

export function evaluateCalorieAdjustment(params: {
  weightEntries: Array<{ weight: number; date: string }>;
  recentIntakes: Array<{ calories: number; date: string }>;
  targetCalories: number;
  goal: string;
}): CalorieAdjustmentSuggestion {
  const { weightEntries, recentIntakes, targetCalories, goal } = params;

  if (weightEntries.length < 3) {
    return {
      isEligible: false,
      reason:
        "Needs at least 3 weight logs across 14+ days to analyze real-world metabolic rate.",
      daysLogged: weightEntries.length,
      weighInCount: weightEntries.length,
      weeklyRateKg: 0,
      targetCalories,
      status: "insufficient_data",
      badge: { label: "Gathering Data", color: "text-muted-foreground" },
      recommendation:
        "Log your weight at least 2-3 times per week to enable realistic TDEE calibrations.",
      adjustmentKcal: 0,
    };
  }

  const sortedWeights = [...weightEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const firstDate = new Date(sortedWeights[0].date);
  const lastDate = new Date(sortedWeights[sortedWeights.length - 1].date);
  const daysDiff = Math.max(
    1,
    Math.round(
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  if (daysDiff < 14) {
    return {
      isEligible: false,
      reason: `Requires at least 14 days of data to establish a reliable trend (currently ${daysDiff} days).`,
      daysLogged: daysDiff,
      weighInCount: sortedWeights.length,
      weeklyRateKg: 0,
      targetCalories,
      status: "insufficient_data",
      badge: {
        label: "14-Day Baseline Needed",
        color: "text-muted-foreground",
      },
      recommendation: `Keep tracking for ${14 - daysDiff} more days. Short-term weight swings are mostly fluid shifts.`,
      adjustmentKcal: 0,
    };
  }

  const totalWeightDelta =
    sortedWeights[sortedWeights.length - 1].weight - sortedWeights[0].weight;
  const weeklyRateKg =
    Math.round((totalWeightDelta / (daysDiff / 7)) * 100) / 100;

  let avgDailyIntakeKcal: number | undefined;
  if (recentIntakes.length > 0) {
    const totalIntake = recentIntakes.reduce(
      (sum, item) => sum + item.calories,
      0,
    );
    avgDailyIntakeKcal = Math.round(totalIntake / recentIntakes.length);
  }

  if (goal === "lose_weight") {
    const rateOfLoss = -weeklyRateKg;

    if (rateOfLoss < 0.2) {
      const isUnderlogged =
        avgDailyIntakeKcal !== undefined &&
        avgDailyIntakeKcal <= targetCalories - 150;
      return {
        isEligible: true,
        daysLogged: daysDiff,
        weighInCount: sortedWeights.length,
        weeklyRateKg,
        avgDailyIntakeKcal,
        targetCalories,
        status: "slow_or_underlogged",
        badge: {
          label: "Plateau / Slow Loss",
          color: "text-amber-600 dark:text-amber-400",
        },
        recommendation: isUnderlogged
          ? "Weight loss is under 0.2 kg/week despite logged intake showing a large deficit. Possible under-logging of cooking oil/condiments or lower real TDEE. Suggest holding current target with stricter food weighing, or reducing by ~150 kcal."
          : "Weight loss is under 0.2 kg/week. If you've been consistent, your actual TDEE may be slightly lower than estimated. Suggest trimming daily intake by ~150 kcal.",
        adjustmentKcal: -150,
      };
    }

    if (rateOfLoss > 0.7) {
      return {
        isEligible: true,
        daysLogged: daysDiff,
        weighInCount: sortedWeights.length,
        weeklyRateKg,
        avgDailyIntakeKcal,
        targetCalories,
        status: "too_fast",
        badge: {
          label: "Rapid Loss (>0.7 kg/wk)",
          color: "text-orange-600 dark:text-orange-400",
        },
        recommendation:
          "Weight loss exceeds 0.7 kg/week. Losing too rapidly increases risk of lean muscle loss and metabolic slowdown. Suggest adding ~150 kcal/day to protect muscle and metabolic rate.",
        adjustmentKcal: 150,
      };
    }

    return {
      isEligible: true,
      daysLogged: daysDiff,
      weighInCount: sortedWeights.length,
      weeklyRateKg,
      avgDailyIntakeKcal,
      targetCalories,
      status: "healthy_rate",
      badge: {
        label: "Optimal Fat Loss Rate",
        color: "text-emerald-600 dark:text-emerald-400",
      },
      recommendation: `Your fat loss pace of ${rateOfLoss.toFixed(1)} kg/week is in the ideal sustainable range (0.2–0.7 kg/wk). Keep current targets!`,
      adjustmentKcal: 0,
    };
  }

  return {
    isEligible: true,
    daysLogged: daysDiff,
    weighInCount: sortedWeights.length,
    weeklyRateKg,
    avgDailyIntakeKcal,
    targetCalories,
    status: "healthy_rate",
    badge: { label: "Trend Stable", color: "text-blue-600 dark:text-blue-400" },
    recommendation:
      "Weight trend is aligned with your routine. TDEE multipliers are statistical estimates.",
    adjustmentKcal: 0,
  };
}

export interface UnifiedHealthMetricsParams {
  gender: Gender | string;
  age: number;
  heightCm: number;
  currentWeightKg: number;
  startWeightKg?: number;
  targetWeightKg?: number;
  activityLevel: string;
  goal: "lose_weight" | "gain_muscle" | "maintain" | string;
  workoutDaysPerWeek?: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  useCustomMacros?: boolean;
  customCalories?: number;
  customProtein?: number;
  customFat?: number;
  customCarb?: number;
  customFiber?: number;
  customWaterMl?: number;
  proteinRatioOverride?: number;
}

/**
 * SINGLE SOURCE OF TRUTH: Unified calculation engine for BMR, TDEE,
 * body composition, and nutrition targets. Used across Overview, Targets,
 * Diet, and AI Coach tabs.
 */
export function calculateUnifiedHealthMetrics(
  params: UnifiedHealthMetricsParams,
) {
  const {
    gender,
    age,
    heightCm,
    currentWeightKg,
    startWeightKg,
    targetWeightKg,
    activityLevel,
    goal,
    workoutDaysPerWeek = 4,
    waistCm,
    neckCm,
    hipCm,
    useCustomMacros = false,
    customCalories,
    customProtein,
    customFat,
    customCarb,
    customFiber,
    customWaterMl,
    proteinRatioOverride,
  } = params;

  const validGender = (
    gender === "female" ? "female" : gender === "other" ? "other" : "male"
  ) as Gender;
  const currentWeight = currentWeightKg > 0 ? currentWeightKg : 70;
  const startWeight = startWeightKg && startWeightKg > 0 ? startWeightKg : currentWeight;
  const targetWeight = targetWeightKg && targetWeightKg > 0 ? targetWeightKg : currentWeight;

  // 1. BMR & TDEE (Mifflin-St Jeor)
  const bmr = calcBMR(currentWeight, heightCm, age, validGender);
  const tdee = calcTDEE(bmr, activityLevel);
  const activityMult =
    ACTIVITY_MULTIPLIERS[activityLevel]?.multiplier || 1.55;
  const activityLabel =
    ACTIVITY_MULTIPLIERS[activityLevel]?.label || "Moderate (3-5 days/week)";

  // 2. BMI
  const bmi = calcBMI(currentWeight, heightCm);
  const bmiCategory = getBMICategory(bmi);
  const idealWeightRange = calcIdealWeightRange(heightCm, validGender);

  // 3. Body Composition (US Navy)
  const bodyFatPct = calcBodyFatPercentage({
    gender: validGender,
    heightCm,
    waistCm,
    neckCm,
    hipCm,
  });
  const bodyFatRange = getBodyFatRange(bodyFatPct);
  const bodyFatCategory =
    bodyFatPct !== null ? getBodyFatCategory(bodyFatPct, validGender) : null;
  const fatMass = calcFatMass(currentWeight, bodyFatPct);
  const leanMass = calcLeanBodyMass(currentWeight, bodyFatPct);

  // 4. Circumference Ratios
  const whr = calcWaistToHipRatio(waistCm, hipCm);
  const whrRisk = whr !== null ? getWHRRiskCategory(whr, validGender) : null;
  const whtr = calcWaistToHeightRatio(waistCm, heightCm);
  const whtrCategory = whtr !== null ? getWHtRCategory(whtr) : null;

  // 5. Weight Progress
  const weightProgress = calcWeightProgress(
    startWeight,
    currentWeight,
    targetWeight,
  );

  // 6. Targets & Macros
  let dailyCaloriesGoal: number;
  if (useCustomMacros && customCalories && customCalories > 0) {
    dailyCaloriesGoal = Math.max(500, Math.round(customCalories));
  } else if (goal === "lose_weight") {
    const minCalories = validGender === "female" ? 1200 : 1400;
    dailyCaloriesGoal = Math.max(minCalories, Math.round(tdee - 450));
  } else if (goal === "gain_muscle") {
    dailyCaloriesGoal = Math.round(tdee + 300);
  } else {
    dailyCaloriesGoal = tdee;
  }

  // Protein Target (default 1.4 g/kg for fat loss, user-editable 1.2-2.0 or override)
  const proteinRec = calcRecommendedProtein({
    weightKg: currentWeight,
    goal,
    activityLevel,
    proteinRatioOverride,
    customProteinGrams: useCustomMacros ? customProtein : undefined,
  });
  const dailyProteinGoal = proteinRec.grams;

  // Fat Target (25% of calories / 9)
  const dailyFatGoal =
    useCustomMacros && customFat && customFat > 0
      ? customFat
      : Math.max(40, Math.round((dailyCaloriesGoal * 0.25) / 9));

  // Carb Target (remaining calories / 4)
  const proteinCals = dailyProteinGoal * 4;
  const fatCals = dailyFatGoal * 9;
  const remainingCals = Math.max(0, dailyCaloriesGoal - (proteinCals + fatCals));
  const dailyCarbGoal =
    useCustomMacros && customCarb && customCarb >= 0
      ? customCarb
      : Math.round(remainingCals / 4);

  // Fiber Target (14g per 1000 kcal)
  const dailyFiberGoal =
    useCustomMacros && customFiber && customFiber > 0
      ? customFiber
      : Math.max(25, Math.round((dailyCaloriesGoal / 1000) * 14));

  // Water Target (~35ml/kg + activity adjustment)
  const activityWaterBonus =
    activityLevel === "active" ? 400 : activityLevel === "very_active" ? 700 : 0;
  const waterGoalMl =
    useCustomMacros && customWaterMl && customWaterMl > 0
      ? customWaterMl
      : Math.round(currentWeight * 35 + activityWaterBonus);

  return {
    currentWeight,
    startWeight,
    targetWeight,
    height: heightCm,
    age,
    gender: validGender,
    activityLevel,
    activityMultiplierUsed: activityMult,
    activityLabel,
    goal,
    workoutDaysPerWeek,
    bmr,
    tdee,
    bmi,
    bmiCategory,
    idealWeightRange,
    bodyFatPct,
    bodyFatRange,
    bodyFatCategory,
    leanMass,
    fatMass,
    whr,
    whrRisk,
    whtr,
    whtrCategory,
    weightProgress,
    targets: {
      dailyCaloriesGoal,
      dailyProteinGoal,
      dailyFatGoal,
      dailyCarbGoal,
      dailyFiberGoal,
      waterGoalMl,
      bmr,
      tdee,
      proteinRatioUsed: proteinRec.ratioUsed,
      isCustom: useCustomMacros,
    },
  };
}
