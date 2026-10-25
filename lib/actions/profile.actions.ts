"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { profileSchema, type ProfileFormValues } from "@/validations/fitness";
import type {
  PrimaryGoal,
  ActivityLevel,
  Gender,
  IUserProfile,
  IBodyMeasurement,
} from "@/types/fitness";
import {
  calcBMI,
  getBMICategory,
  calcIdealWeightRange,
  calcBodyFatPercentage,
  getBodyFatCategory,
  calcLeanBodyMass,
  calcFatMass,
  calcWaistToHipRatio,
  getWHRRiskCategory,
  calcWaistToHeightRatio,
  getWHtRCategory,
} from "@/lib/health-calculations";

export interface MacroCalculationOptions {
  gender: Gender;
  age: number;
  height: number;
  currentWeight: number;
  targetWeight?: number;
  activityLevel: ActivityLevel;
  goal: PrimaryGoal;
  proteinRatio?: number; // Optional user-chosen g/kg (e.g. 1.2, 1.4, 1.6, 2.0)
  calorieAdjustment?: number; // Optional custom deficit / surplus in kcal
}

export async function calculateRecommendedMacros(data: MacroCalculationOptions) {
  const {
    gender,
    age,
    height,
    currentWeight,
    activityLevel,
    goal,
    proteinRatio,
    calorieAdjustment,
  } = data;

  // BMR Calculation using Mifflin-St Jeor Equation
  let bmr = 10 * currentWeight + 6.25 * height - 5 * age;
  if (gender === "male") {
    bmr += 5;
  } else if (gender === "female") {
    bmr -= 161;
  } else {
    bmr -= 78; // average offset for 'other'
  }

  // TDEE Multipliers based on Activity Level
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));

  // Daily Calorie Goal Adjustment based on Goal
  let dailyCaloriesGoal = tdee;
  const customAdj =
    typeof calorieAdjustment === "number" && !isNaN(calorieAdjustment)
      ? calorieAdjustment
      : null;

  if (goal === "lose_weight") {
    // Sustainable deficit (~0.4-0.5kg/week fat loss)
    const deficit = customAdj ?? 450;
    const minCalories = gender === "female" ? 1200 : 1400;
    dailyCaloriesGoal = Math.max(minCalories, Math.round(tdee - deficit));
  } else if (goal === "gain_muscle") {
    // Clean hypertrophy surplus
    const surplus = customAdj ?? 300;
    dailyCaloriesGoal = Math.round(tdee + surplus);
  } else {
    // Maintain weight
    const adj = customAdj ?? 0;
    dailyCaloriesGoal = Math.round(tdee + adj);
  }

  // Smart Goal-Based Protein Recommendation (User customizable, NOT forced 2.0x!)
  // If user passed a specific proteinRatio (e.g. 1.2, 1.4, 1.6, 2.0 g/kg), respect it.
  // Otherwise, derive scientifically from goal:
  // - Maintain: 1.2 g/kg (sedentary/light) or 1.4 g/kg (moderate/active)
  // - Lose weight: 1.6 g/kg (preserves muscle in deficit without overload)
  // - Gain muscle: 1.8 g/kg (moderate) or 2.0 g/kg (heavy lifting)
  let effectiveProteinRatio = 1.6;
  if (typeof proteinRatio === "number" && proteinRatio > 0) {
    effectiveProteinRatio = proteinRatio;
  } else if (goal === "maintain") {
    effectiveProteinRatio =
      activityLevel === "active" || activityLevel === "very_active" ? 1.4 : 1.2;
  } else if (goal === "lose_weight") {
    effectiveProteinRatio = 1.6;
  } else if (goal === "gain_muscle") {
    effectiveProteinRatio =
      activityLevel === "active" || activityLevel === "very_active" ? 2.0 : 1.8;
  }

  const dailyProteinGoal = Math.max(
    45,
    Math.round(currentWeight * effectiveProteinRatio),
  );

  // Fat: 25% of daily calories (1g fat = 9 kcal), min 40g for hormonal health
  const dailyFatGoal = Math.max(40, Math.round((dailyCaloriesGoal * 0.25) / 9));

  // Carbs: Remaining calories (1g carb = 4 kcal)
  const proteinCalories = dailyProteinGoal * 4;
  const fatCalories = dailyFatGoal * 9;
  const remainingCalories = Math.max(
    0,
    dailyCaloriesGoal - (proteinCalories + fatCalories),
  );
  const dailyCarbGoal = Math.round(remainingCalories / 4);

  // Fiber: 14g per 1000 kcal recommendation
  const dailyFiberGoal = Math.max(
    25,
    Math.round((dailyCaloriesGoal / 1000) * 14),
  );

  // Water: ~35ml per kg bodyweight + activity adjustment
  const activityWaterBonus =
    activityLevel === "active"
      ? 400
      : activityLevel === "very_active"
        ? 700
        : 0;
  const waterGoalMl = Math.round(currentWeight * 35 + activityWaterBonus);

  return {
    dailyCaloriesGoal,
    dailyProteinGoal,
    dailyFatGoal,
    dailyCarbGoal,
    dailyFiberGoal,
    waterGoalMl,
    bmr: Math.round(bmr),
    tdee,
    proteinRatioUsed: effectiveProteinRatio,
  };
}

export async function getFullProfileHealthMetrics() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = (await UserProfile.findOne({
    clerkId: user.id,
  }).lean()) as IUserProfile | null;
  if (!profile) return null;

  const latestMeasurements = (await BodyMeasurement.findOne({
    clerkId: user.id,
  })
    .sort({ date: -1, updatedAt: -1 })
    .lean()) as IBodyMeasurement | null;

  const weight = profile.currentWeight || 0;
  const height = profile.height || 0;

  const bmi = calcBMI(weight, height);
  const bmiCategory = getBMICategory(bmi);
  const idealRange = calcIdealWeightRange(height, profile.gender as Gender);

  const bodyFatPct = calcBodyFatPercentage({
    gender: profile.gender as Gender,
    heightCm: height,
    waistCm: latestMeasurements?.waist,
    neckCm: latestMeasurements?.neck,
    hipCm: latestMeasurements?.hip,
  });

  const bodyFatCategory =
    bodyFatPct !== null
      ? getBodyFatCategory(bodyFatPct, profile.gender as Gender)
      : null;

  const leanMass = calcLeanBodyMass(weight, bodyFatPct);
  const fatMass = calcFatMass(weight, bodyFatPct);

  const whr = calcWaistToHipRatio(
    latestMeasurements?.waist,
    latestMeasurements?.hip,
  );
  const whrRisk =
    whr !== null ? getWHRRiskCategory(whr, profile.gender as Gender) : null;

  const whtr = calcWaistToHeightRatio(latestMeasurements?.waist, height);
  const whtrCategory = whtr !== null ? getWHtRCategory(whtr) : null;

  const recommended = await calculateRecommendedMacros({
    gender: profile.gender as Gender,
    age: profile.age,
    height,
    currentWeight: weight,
    targetWeight: profile.targetWeight,
    activityLevel: profile.activityLevel as ActivityLevel,
    goal: profile.goal as PrimaryGoal,
  });

  const activeMacros = {
    dailyCaloriesGoal: profile.dailyCaloriesGoal || recommended.dailyCaloriesGoal,
    dailyProteinGoal: profile.dailyProteinGoal || recommended.dailyProteinGoal,
    dailyFatGoal: profile.dailyFatGoal || recommended.dailyFatGoal,
    dailyCarbGoal: profile.dailyCarbGoal || recommended.dailyCarbGoal,
    dailyFiberGoal: profile.dailyFiberGoal || recommended.dailyFiberGoal,
    waterGoalMl: profile.waterGoalMl || recommended.waterGoalMl,
    bmr: recommended.bmr,
    tdee: recommended.tdee,
  };

  const activityLabels: Record<ActivityLevel, string> = {
    sedentary: "Sedentary (Little/No Exercise)",
    light: "Light (1-3 days/week)",
    moderate: "Moderate (3-5 days/week)",
    active: "Active (6-7 days/week)",
    very_active: "Very Active (Athlete/Physical Job)",
  };

  const goalLabels: Record<PrimaryGoal, string> = {
    lose_weight: "Lose Weight 🔥",
    gain_muscle: "Gain Muscle 💪",
    maintain: "Maintain Weight ⚖️",
  };

  return {
    profile: JSON.parse(JSON.stringify(profile)),
    latestMeasurements: latestMeasurements
      ? JSON.parse(JSON.stringify(latestMeasurements))
      : null,
    metrics: {
      bmi,
      bmiCategory,
      idealWeightRange: idealRange,
      bodyFatPct,
      bodyFatCategory,
      leanMass,
      fatMass,
      whr,
      whrRisk,
      whtr,
      whtrCategory,
      bmr: recommended.bmr,
      tdee: recommended.tdee,
    },
    macros: activeMacros,
    recommendedMacros: recommended,
    labels: {
      activity: activityLabels[profile.activityLevel as ActivityLevel],
      goal: goalLabels[profile.goal as PrimaryGoal],
    },
  };
}

export async function getUserProfile() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = await UserProfile.findOne({ clerkId: user.id }).lean();
  return profile ? JSON.parse(JSON.stringify(profile)) : null;
}

/**
 * Single source of truth for nutrition targets across the app.
 * Returns the user's active configured targets (falling back to scientific
 * recommendations if not yet customized) alongside the recommended baseline.
 */
export async function getProfileNutritionTargets() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = (await UserProfile.findOne({
    clerkId: user.id,
  }).lean()) as IUserProfile | null;
  if (!profile) return null;

  const recommended = await calculateRecommendedMacros({
    gender: profile.gender as Gender,
    age: profile.age,
    height: profile.height,
    currentWeight: profile.currentWeight,
    targetWeight: profile.targetWeight,
    activityLevel: profile.activityLevel as ActivityLevel,
    goal: profile.goal as PrimaryGoal,
  });

  const activeMacros = {
    dailyCaloriesGoal: profile.dailyCaloriesGoal || recommended.dailyCaloriesGoal,
    dailyProteinGoal: profile.dailyProteinGoal || recommended.dailyProteinGoal,
    dailyFatGoal: profile.dailyFatGoal || recommended.dailyFatGoal,
    dailyCarbGoal: profile.dailyCarbGoal || recommended.dailyCarbGoal,
    dailyFiberGoal: profile.dailyFiberGoal || recommended.dailyFiberGoal,
    waterGoalMl: profile.waterGoalMl || recommended.waterGoalMl,
    bmr: recommended.bmr,
    tdee: recommended.tdee,
    proteinRatioUsed: recommended.proteinRatioUsed,
  };

  return JSON.parse(
    JSON.stringify({
      profile,
      macros: activeMacros,
      recommended,
    }),
  ) as {
    profile: IUserProfile;
    macros: typeof activeMacros;
    recommended: typeof recommended;
  };
}

export interface TargetUpdateValues {
  goal?: PrimaryGoal;
  targetWeight?: number;
  activityLevel?: ActivityLevel;
  workoutDaysPerWeek?: number;
  dailyCaloriesGoal?: number;
  dailyProteinGoal?: number;
  dailyFatGoal?: number;
  dailyCarbGoal?: number;
  dailyFiberGoal?: number;
  waterGoalMl?: number;
}

/**
 * Direct target & goal updater from the profile page.
 * Persists immediately and syncs real data across dashboard, diet, and analytics.
 */
export async function updateNutritionTargets(targets: TargetUpdateValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const updateFields: Record<string, unknown> = {};

  if (typeof targets.dailyCaloriesGoal === "number" && !isNaN(targets.dailyCaloriesGoal)) {
    updateFields.dailyCaloriesGoal = Math.max(500, Math.round(targets.dailyCaloriesGoal));
  }
  if (typeof targets.dailyProteinGoal === "number" && !isNaN(targets.dailyProteinGoal)) {
    updateFields.dailyProteinGoal = Math.max(20, Math.round(targets.dailyProteinGoal));
  }
  if (typeof targets.dailyFatGoal === "number" && !isNaN(targets.dailyFatGoal)) {
    updateFields.dailyFatGoal = Math.max(10, Math.round(targets.dailyFatGoal));
  }
  if (typeof targets.dailyCarbGoal === "number" && !isNaN(targets.dailyCarbGoal)) {
    updateFields.dailyCarbGoal = Math.max(0, Math.round(targets.dailyCarbGoal));
  }
  if (typeof targets.dailyFiberGoal === "number" && !isNaN(targets.dailyFiberGoal)) {
    updateFields.dailyFiberGoal = Math.max(5, Math.round(targets.dailyFiberGoal));
  }
  if (typeof targets.waterGoalMl === "number" && !isNaN(targets.waterGoalMl)) {
    updateFields.waterGoalMl = Math.max(500, Math.round(targets.waterGoalMl));
  }
  if (typeof targets.targetWeight === "number" && !isNaN(targets.targetWeight)) {
    updateFields.targetWeight = Math.max(20, Math.round(targets.targetWeight * 10) / 10);
  }
  if (targets.goal) {
    updateFields.goal = targets.goal;
  }
  if (targets.activityLevel) {
    updateFields.activityLevel = targets.activityLevel;
  }
  if (typeof targets.workoutDaysPerWeek === "number" && !isNaN(targets.workoutDaysPerWeek)) {
    updateFields.workoutDaysPerWeek = Math.max(0, Math.min(7, Math.round(targets.workoutDaysPerWeek)));
  }

  const profile = await UserProfile.findOneAndUpdate(
    { clerkId: user.id },
    { $set: updateFields },
    { new: true, upsert: true },
  ).lean();

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/diet");
  revalidatePath("/analytics");

  return JSON.parse(JSON.stringify(profile));
}

export async function createOrUpdateProfile(formData: ProfileFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = profileSchema.parse(formData);

  const profile = await UserProfile.findOneAndUpdate(
    { clerkId: user.id },
    {
      ...validated,
      clerkId: user.id,
      onboardingCompleted: true,
    },
    { new: true, upsert: true },
  );

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/diet");
  revalidatePath("/analytics");
  return JSON.parse(JSON.stringify(profile));
}
