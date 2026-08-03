"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { profileSchema, type ProfileFormValues } from "@/validations/fitness";
import type { PrimaryGoal, ActivityLevel, Gender } from "@/types/fitness";

/** BMR (Mifflin-St Jeor) + TDEE + Goal-based macro calculator */
export async function calculateRecommendedMacros(data: {
  gender: Gender;
  age: number;
  height: number;
  currentWeight: number;
  activityLevel: ActivityLevel;
  goal: PrimaryGoal;
}) {
  const { gender, age, height, currentWeight, activityLevel, goal } = data;

  // Mifflin-St Jeor
  let bmr: number;
  if (gender === "male") {
    bmr = 10 * currentWeight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

  let dailyCalories: number;
  let proteinMultiplier: number;

  switch (goal) {
    case "lose_weight":
      dailyCalories = Math.round(tdee - 500);
      proteinMultiplier = 2.2; // higher protein to preserve muscle
      break;
    case "gain_muscle":
      dailyCalories = Math.round(tdee + 300);
      proteinMultiplier = 2.0;
      break;
    default:
      dailyCalories = tdee;
      proteinMultiplier = 1.8;
  }

  const dailyProteinGoal = Math.round(currentWeight * proteinMultiplier);
  const proteinCalories = dailyProteinGoal * 4;
  const dailyFatGoal = Math.round((dailyCalories * 0.25) / 9);
  const fatCalories = dailyFatGoal * 9;
  const dailyCarbGoal = Math.round(
    (dailyCalories - proteinCalories - fatCalories) / 4
  );
  const dailyFiberGoal = gender === "male" ? 38 : 25;

  return {
    dailyCaloriesGoal: dailyCalories,
    dailyProteinGoal,
    dailyFatGoal,
    dailyCarbGoal,
    dailyFiberGoal,
    waterGoalMl: Math.round(currentWeight * 35), // 35ml per kg
    bmr: Math.round(bmr),
    tdee,
  };
}

export async function getUserProfile() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = await UserProfile.findOne({ clerkId: user.id });
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
    { new: true, upsert: true }
  );

  revalidatePath("/");
  revalidatePath("/profile");
  return JSON.parse(JSON.stringify(profile));
}
