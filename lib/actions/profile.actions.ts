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
import WeightLog from "@/lib/database/models/weight-log.model";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import WorkoutPlan from "@/lib/database/models/workout-plan.model";
import MealLog from "@/lib/database/models/meal-log.model";
import {
  calculateUnifiedHealthMetrics,
  evaluateCalorieAdjustment,
  calcBodyFatPercentage,
  calcFatMass,
  calcLeanBodyMass,
  autoSuggestActivityLevel,
} from "@/lib/health-calculations";
import { getLocalDateString } from "@/lib/utils";

export interface MacroCalculationOptions {
  gender: Gender;
  age: number;
  height: number;
  currentWeight: number;
  targetWeight?: number;
  activityLevel: ActivityLevel;
  goal: PrimaryGoal;
  proteinRatio?: number;
  calorieAdjustment?: number;
}

export async function calculateRecommendedMacros(data: MacroCalculationOptions) {
  const unified = calculateUnifiedHealthMetrics({
    gender: data.gender,
    age: data.age,
    heightCm: data.height,
    currentWeightKg: data.currentWeight,
    targetWeightKg: data.targetWeight,
    activityLevel: data.activityLevel,
    goal: data.goal,
    proteinRatioOverride: data.proteinRatio,
  });

  return {
    dailyCaloriesGoal: unified.targets.dailyCaloriesGoal,
    dailyProteinGoal: unified.targets.dailyProteinGoal,
    dailyFatGoal: unified.targets.dailyFatGoal,
    dailyCarbGoal: unified.targets.dailyCarbGoal,
    dailyFiberGoal: unified.targets.dailyFiberGoal,
    waterGoalMl: unified.targets.waterGoalMl,
    bmr: unified.bmr,
    tdee: unified.tdee,
    proteinRatioUsed: unified.targets.proteinRatioUsed,
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

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfWeekStr = getLocalDateString(startOfWeek);

  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(now.getDate() - 28);
  const fourteenDaysAgoStr = getLocalDateString(fourteenDaysAgo);

  const [
    latestMeasurement,
    firstMeasurement,
    previousMeasurements,
    latestWeightDoc,
    firstWeightDoc,
    weightHistory14,
    recentMeals14,
    workoutsThisWeekCount,
    workoutPlanDoc,
  ] = await Promise.all([
    BodyMeasurement.findOne({ clerkId: user.id })
      .sort({ date: -1, createdAt: -1 })
      .lean() as Promise<IBodyMeasurement | null>,
    BodyMeasurement.findOne({ clerkId: user.id })
      .sort({ date: 1, createdAt: 1 })
      .lean() as Promise<IBodyMeasurement | null>,
    BodyMeasurement.find({ clerkId: user.id })
      .sort({ date: -1, createdAt: -1 })
      .skip(1)
      .limit(1)
      .lean() as unknown as Promise<IBodyMeasurement[]>,
    WeightLog.findOne({ clerkId: user.id })
      .sort({ date: -1, createdAt: -1 })
      .lean() as unknown as Promise<{ weight: number; date: string } | null>,
    WeightLog.findOne({ clerkId: user.id })
      .sort({ date: 1, createdAt: 1 })
      .lean() as unknown as Promise<{ weight: number; date: string } | null>,
    WeightLog.find({ clerkId: user.id, date: { $gte: fourteenDaysAgoStr } })
      .sort({ date: 1 })
      .lean() as unknown as Promise<Array<{ weight: number; date: string }>>,
    MealLog.find({ clerkId: user.id, date: { $gte: fourteenDaysAgoStr } })
      .lean() as unknown as Promise<Array<{ totalCalories: number; date: string }>>,
    WorkoutLog.countDocuments({
      clerkId: user.id,
      date: { $gte: startOfWeekStr },
    }),
    WorkoutPlan.findOne({ clerkId: user.id }).lean(),
  ]);

  const previousMeasurement = previousMeasurements?.[0] || null;

  const currentWeight =
    latestWeightDoc?.weight || profile.currentWeight || 70;
  const startWeight =
    firstWeightDoc?.weight || profile.currentWeight || currentWeight;

  // Single Source of Truth Unified Computation
  const unified = calculateUnifiedHealthMetrics({
    gender: profile.gender,
    age: profile.age,
    heightCm: profile.height,
    currentWeightKg: currentWeight,
    startWeightKg: startWeight,
    targetWeightKg: profile.targetWeight,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
    workoutDaysPerWeek: profile.workoutDaysPerWeek,
    waistCm: latestMeasurement?.waist,
    neckCm: latestMeasurement?.neck,
    hipCm: latestMeasurement?.hip,
    useCustomMacros: profile.useCustomMacros,
    customCalories: profile.dailyCaloriesGoal,
    customProtein: profile.dailyProteinGoal,
    customFat: profile.dailyFatGoal,
    customCarb: profile.dailyCarbGoal,
    customFiber: profile.dailyFiberGoal,
    customWaterMl: profile.waterGoalMl,
  });

  // Calculate body composition delta since first measurement
  let bodyCompChangeSinceFirst: {
    initialFatMass: number | null;
    initialLeanMass: number | null;
    fatMassChange: number | null;
    leanMassChange: number | null;
  } | null = null;

  if (firstMeasurement && firstWeightDoc) {
    const initialBf = calcBodyFatPercentage({
      gender: profile.gender as Gender,
      heightCm: profile.height,
      waistCm: firstMeasurement.waist,
      neckCm: firstMeasurement.neck,
      hipCm: firstMeasurement.hip,
    });
    if (initialBf !== null) {
      const initialFat = calcFatMass(firstWeightDoc.weight, initialBf);
      const initialLean = calcLeanBodyMass(firstWeightDoc.weight, initialBf);
      if (
        initialFat !== null &&
        initialLean !== null &&
        unified.fatMass !== null &&
        unified.leanMass !== null
      ) {
        bodyCompChangeSinceFirst = {
          initialFatMass: initialFat,
          initialLeanMass: initialLean,
          fatMassChange: Math.round((unified.fatMass - initialFat) * 10) / 10,
          leanMassChange: Math.round((unified.leanMass - initialLean) * 10) / 10,
        };
      }
    }
  }

  // Calculate measurement change since first and previous for every circumference
  const measurementKeys = [
    "waist",
    "neck",
    "hip",
    "chest",
    "shoulder",
    "arm",
    "forearm",
    "thigh",
    "calf",
  ] as const;

  const measurementChanges: Record<
    string,
    {
      current?: number;
      sincePrevious?: number;
      sinceFirst?: number;
    }
  > = {};

  measurementKeys.forEach((key) => {
    const curr = latestMeasurement?.[key];
    const prev = previousMeasurement?.[key];
    const first = firstMeasurement?.[key];

    measurementChanges[key] = {
      current: typeof curr === "number" ? curr : undefined,
      sincePrevious:
        typeof curr === "number" && typeof prev === "number"
          ? Math.round((curr - prev) * 10) / 10
          : undefined,
      sinceFirst:
        typeof curr === "number" && typeof first === "number"
          ? Math.round((curr - first) * 10) / 10
          : undefined,
    };
  });

  // Suggested Calorie Adjustment (Requirement 6)
  const mappedIntakes = recentMeals14.map((m) => ({
    calories: Number(m.totalCalories) || 0,
    date: m.date,
  }));
  const suggestedAdjustment = evaluateCalorieAdjustment({
    weightEntries: weightHistory14,
    recentIntakes: mappedIntakes,
    targetCalories: unified.targets.dailyCaloriesGoal,
    goal: profile.goal,
  });

  // Workout Logging Prompt & Auto-suggested activity level (Requirement 9)
  const hasScheduledWorkouts = (profile.workoutDaysPerWeek || 0) > 0;
  const needsWorkoutLog =
    hasScheduledWorkouts &&
    !!workoutPlanDoc &&
    workoutsThisWeekCount === 0;
  const suggestedActivityLevel = autoSuggestActivityLevel(
    profile.workoutDaysPerWeek || 0,
  );

  // Auto-sync stale DB numbers if using automatic macros
  if (
    !profile.useCustomMacros &&
    (profile.dailyCaloriesGoal !== unified.targets.dailyCaloriesGoal ||
      profile.dailyProteinGoal !== unified.targets.dailyProteinGoal)
  ) {
    await UserProfile.updateOne(
      { clerkId: user.id },
      {
        $set: {
          dailyCaloriesGoal: unified.targets.dailyCaloriesGoal,
          dailyProteinGoal: unified.targets.dailyProteinGoal,
          dailyFatGoal: unified.targets.dailyFatGoal,
          dailyCarbGoal: unified.targets.dailyCarbGoal,
          dailyFiberGoal: unified.targets.dailyFiberGoal,
          waterGoalMl: unified.targets.waterGoalMl,
          useCustomMacros: false,
        },
      },
    );
  }

  const activityLabels: Record<string, string> = {
    sedentary: "Sedentary (Little/No Exercise)",
    light: "Light (1-2 days/week)",
    moderate: "Moderate (3-5 days/week)",
    active: "Active (6-7 days/week)",
    very_active: "Very Active (Athlete/Physical Job)",
  };

  const goalLabels: Record<string, string> = {
    lose_weight: "Lose Weight 🔥",
    gain_muscle: "Gain Muscle 💪",
    maintain: "Maintain Weight ⚖️",
  };

  return {
    profile: JSON.parse(JSON.stringify(profile)),
    latestMeasurements: latestMeasurement
      ? JSON.parse(JSON.stringify(latestMeasurement))
      : null,
    firstMeasurement: firstMeasurement
      ? JSON.parse(JSON.stringify(firstMeasurement))
      : null,
    previousMeasurement: previousMeasurement
      ? JSON.parse(JSON.stringify(previousMeasurement))
      : null,
    measurementChanges,
    bodyCompChangeSinceFirst,
    metrics: {
      currentWeight: unified.currentWeight,
      startWeight: unified.startWeight,
      targetWeight: unified.targetWeight,
      bmi: unified.bmi,
      bmiCategory: unified.bmiCategory,
      idealWeightRange: unified.idealWeightRange,
      bodyFatPct: unified.bodyFatPct,
      bodyFatRange: unified.bodyFatRange,
      bodyFatCategory: unified.bodyFatCategory,
      leanMass: unified.leanMass,
      fatMass: unified.fatMass,
      whr: unified.whr,
      whrRisk: unified.whrRisk,
      whtr: unified.whtr,
      whtrCategory: unified.whtrCategory,
      bmr: unified.bmr,
      tdee: unified.tdee,
      activityMultiplierUsed: unified.activityMultiplierUsed,
      weightProgress: unified.weightProgress,
    },
    macros: unified.targets,
    recommendedMacros: unified.targets,
    suggestedAdjustment,
    workoutStatus: {
      workoutsThisWeekCount,
      needsWorkoutLog,
      hasScheduledWorkouts,
      suggestedActivityLevel,
    },
    labels: {
      activity:
        activityLabels[profile.activityLevel] ||
        unified.activityLabel,
      goal: goalLabels[profile.goal] || "Fitness Goal",
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

  const [profile, latestWeightDoc] = await Promise.all([
    UserProfile.findOne({ clerkId: user.id }).lean() as Promise<IUserProfile | null>,
    WeightLog.findOne({ clerkId: user.id }).sort({ date: -1, createdAt: -1 }).lean() as Promise<{ weight: number } | null>,
  ]);
  if (!profile) return null;

  const currentWeight = latestWeightDoc?.weight || profile.currentWeight;

  const recommended = await calculateRecommendedMacros({
    gender: profile.gender as Gender,
    age: profile.age,
    height: profile.height,
    currentWeight,
    targetWeight: profile.targetWeight,
    activityLevel: profile.activityLevel as ActivityLevel,
    goal: profile.goal as PrimaryGoal,
  });

  const isCustom = profile.useCustomMacros === true;

  const activeMacros = {
    dailyCaloriesGoal:
      isCustom && profile.dailyCaloriesGoal
        ? profile.dailyCaloriesGoal
        : recommended.dailyCaloriesGoal,
    dailyProteinGoal:
      isCustom && profile.dailyProteinGoal
        ? profile.dailyProteinGoal
        : recommended.dailyProteinGoal,
    dailyFatGoal:
      isCustom && profile.dailyFatGoal
        ? profile.dailyFatGoal
        : recommended.dailyFatGoal,
    dailyCarbGoal:
      isCustom && profile.dailyCarbGoal
        ? profile.dailyCarbGoal
        : recommended.dailyCarbGoal,
    dailyFiberGoal:
      isCustom && profile.dailyFiberGoal
        ? profile.dailyFiberGoal
        : recommended.dailyFiberGoal,
    waterGoalMl:
      isCustom && profile.waterGoalMl
        ? profile.waterGoalMl
        : recommended.waterGoalMl,
    bmr: recommended.bmr,
    tdee: recommended.tdee,
    proteinRatioUsed: recommended.proteinRatioUsed,
    isCustom,
  };

  // If not custom and stale in DB, auto-sync DB
  if (
    !isCustom &&
    (profile.dailyCaloriesGoal !== recommended.dailyCaloriesGoal ||
      profile.dailyProteinGoal !== recommended.dailyProteinGoal)
  ) {
    await UserProfile.updateOne(
      { clerkId: user.id },
      {
        $set: {
          dailyCaloriesGoal: recommended.dailyCaloriesGoal,
          dailyProteinGoal: recommended.dailyProteinGoal,
          dailyFatGoal: recommended.dailyFatGoal,
          dailyCarbGoal: recommended.dailyCarbGoal,
          dailyFiberGoal: recommended.dailyFiberGoal,
          waterGoalMl: recommended.waterGoalMl,
          useCustomMacros: false,
        },
      },
    );
  }

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
  useCustomMacros?: boolean;
}

/**
 * Direct target & goal updater from the profile page.
 * Persists immediately and syncs real data across dashboard, diet, and analytics.
 */
export async function updateNutritionTargets(targets: TargetUpdateValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const existingProfile = (await UserProfile.findOne({
    clerkId: user.id,
  }).lean()) as IUserProfile | null;

  const updateFields: Record<string, unknown> = {};

  if (typeof targets.useCustomMacros === "boolean") {
    updateFields.useCustomMacros = targets.useCustomMacros;
  }

  if (
    typeof targets.targetWeight === "number" &&
    !isNaN(targets.targetWeight)
  ) {
    updateFields.targetWeight =
      Math.max(20, Math.round(targets.targetWeight * 10) / 10);
  }
  if (targets.goal) {
    updateFields.goal = targets.goal;
  }
  if (targets.activityLevel) {
    updateFields.activityLevel = targets.activityLevel;
  }
  if (
    typeof targets.workoutDaysPerWeek === "number" &&
    !isNaN(targets.workoutDaysPerWeek)
  ) {
    updateFields.workoutDaysPerWeek = Math.max(
      0,
      Math.min(7, Math.round(targets.workoutDaysPerWeek)),
    );
  }

  const isCustom =
    targets.useCustomMacros ?? existingProfile?.useCustomMacros ?? false;

  if (isCustom) {
    if (
      typeof targets.dailyCaloriesGoal === "number" &&
      !isNaN(targets.dailyCaloriesGoal)
    ) {
      updateFields.dailyCaloriesGoal = Math.max(
        500,
        Math.round(targets.dailyCaloriesGoal),
      );
    }
    if (
      typeof targets.dailyProteinGoal === "number" &&
      !isNaN(targets.dailyProteinGoal)
    ) {
      updateFields.dailyProteinGoal = Math.max(
        20,
        Math.round(targets.dailyProteinGoal),
      );
    }
    if (
      typeof targets.dailyFatGoal === "number" &&
      !isNaN(targets.dailyFatGoal)
    ) {
      updateFields.dailyFatGoal = Math.max(
        10,
        Math.round(targets.dailyFatGoal),
      );
    }
    if (
      typeof targets.dailyCarbGoal === "number" &&
      !isNaN(targets.dailyCarbGoal)
    ) {
      updateFields.dailyCarbGoal = Math.max(
        0,
        Math.round(targets.dailyCarbGoal),
      );
    }
    if (
      typeof targets.dailyFiberGoal === "number" &&
      !isNaN(targets.dailyFiberGoal)
    ) {
      updateFields.dailyFiberGoal = Math.max(
        5,
        Math.round(targets.dailyFiberGoal),
      );
    }
    if (
      typeof targets.waterGoalMl === "number" &&
      !isNaN(targets.waterGoalMl)
    ) {
      updateFields.waterGoalMl = Math.max(
        500,
        Math.round(targets.waterGoalMl),
      );
    }
    updateFields.useCustomMacros = true;
  } else if (existingProfile) {
    const newGoal = (targets.goal || existingProfile.goal) as PrimaryGoal;
    const newActivity = (targets.activityLevel ||
      existingProfile.activityLevel) as ActivityLevel;
    const newTargetWeight =
      targets.targetWeight || existingProfile.targetWeight;

    const recommended = await calculateRecommendedMacros({
      gender: existingProfile.gender as Gender,
      age: existingProfile.age,
      height: existingProfile.height,
      currentWeight: existingProfile.currentWeight,
      targetWeight: newTargetWeight,
      activityLevel: newActivity,
      goal: newGoal,
    });

    updateFields.dailyCaloriesGoal = recommended.dailyCaloriesGoal;
    updateFields.dailyProteinGoal = recommended.dailyProteinGoal;
    updateFields.dailyFatGoal = recommended.dailyFatGoal;
    updateFields.dailyCarbGoal = recommended.dailyCarbGoal;
    updateFields.dailyFiberGoal = recommended.dailyFiberGoal;
    updateFields.waterGoalMl = recommended.waterGoalMl;
    updateFields.useCustomMacros = false;
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

  if (!validated.useCustomMacros) {
    const recommended = await calculateRecommendedMacros({
      gender: validated.gender as Gender,
      age: validated.age,
      height: validated.height,
      currentWeight: validated.currentWeight,
      targetWeight: validated.targetWeight,
      activityLevel: validated.activityLevel as ActivityLevel,
      goal: validated.goal as PrimaryGoal,
    });

    validated.dailyCaloriesGoal = recommended.dailyCaloriesGoal;
    validated.dailyProteinGoal = recommended.dailyProteinGoal;
    validated.dailyFatGoal = recommended.dailyFatGoal;
    validated.dailyCarbGoal = recommended.dailyCarbGoal;
    validated.dailyFiberGoal = recommended.dailyFiberGoal;
    validated.waterGoalMl = recommended.waterGoalMl;
    validated.useCustomMacros = false;
  }

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
