"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { profileSchema, type ProfileFormValues } from "@/validations/fitness";
import type { PrimaryGoal, ActivityLevel, Gender, IUserProfile, IBodyMeasurement } from "@/types/fitness";
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

export async function calculateRecommendedMacros(data: {
  gender: Gender;
  age: number;
  height: number;
  currentWeight: number;
  targetWeight?: number;
  activityLevel: ActivityLevel;
  goal: PrimaryGoal;
}) {
  const {
    gender,
    age,
    height,
    currentWeight,
    activityLevel,
    goal,
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
  if (goal === "lose_weight") {
    // 500 kcal deficit for ~0.5kg/week weight loss
    dailyCaloriesGoal = Math.max(1200, tdee - 500);
  } else if (goal === "gain_muscle") {
    // 300 kcal surplus for lean gain
    dailyCaloriesGoal = tdee + 300;
  }

  // Protein: ~2.0g per kg of current weight (for active/workout people)
  const dailyProteinGoal = Math.round(currentWeight * 2.0);

  // Fat: 25% of daily calories (1g fat = 9 kcal)
  const dailyFatGoal = Math.round((dailyCaloriesGoal * 0.25) / 9);

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

  return {
    dailyCaloriesGoal,
    dailyProteinGoal,
    dailyFatGoal,
    dailyCarbGoal,
    dailyFiberGoal,
    waterGoalMl: Math.round(currentWeight * 35),
    bmr: Math.round(bmr),
    tdee,
  };
}

export async function getFullProfileHealthMetrics() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = (await UserProfile.findOne({ clerkId: user.id }).lean()) as IUserProfile | null;
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

  const macros = await calculateRecommendedMacros({
    gender: profile.gender as Gender,
    age: profile.age,
    height,
    currentWeight: weight,
    activityLevel: profile.activityLevel as ActivityLevel,
    goal: profile.goal as PrimaryGoal,
  });

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
      bmr: macros.bmr,
      tdee: macros.tdee,
    },
    macros: {
      dailyCaloriesGoal: macros.dailyCaloriesGoal,
      dailyProteinGoal: macros.dailyProteinGoal,
      dailyFatGoal: macros.dailyFatGoal,
      dailyCarbGoal: macros.dailyCarbGoal,
      dailyFiberGoal: macros.dailyFiberGoal,
      waterGoalMl: macros.waterGoalMl,
    },
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
  return JSON.parse(JSON.stringify(profile));
}
