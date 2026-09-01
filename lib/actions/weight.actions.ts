"use server";

import { connectToDatabase } from "@/lib/database";
import WeightLog from "@/lib/database/models/weight-log.model";
import UserProfile from "@/lib/database/models/user-profile.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { weightLogSchema, type WeightLogFormValues } from "@/validations/fitness";
import type { IUserProfile, IWeightLog } from "@/types/fitness";

import { calculateRecommendedMacros } from "@/lib/actions/profile.actions";
import { getLocalDateString } from "@/lib/utils";

export async function logWeight(formData: WeightLogFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = weightLogSchema.parse(formData);

  const weight = await WeightLog.findOneAndUpdate(
    { clerkId: user.id, date: validated.date },
    { ...validated, clerkId: user.id },
    { new: true, upsert: true }
  );

  // Fetch current user profile to recalculate adaptive goals
  const existingProfile = await UserProfile.findOne({ clerkId: user.id }).lean() as IUserProfile | null;

  let adaptiveUpdate = null;

  if (existingProfile) {
    const oldCalories = existingProfile.dailyCaloriesGoal;
    const oldProtein = existingProfile.dailyProteinGoal;

    const newMacros = await calculateRecommendedMacros({
      gender: existingProfile.gender,
      age: existingProfile.age,
      height: existingProfile.height,
      currentWeight: validated.weight,
      targetWeight: existingProfile.targetWeight,
      activityLevel: existingProfile.activityLevel,
      goal: existingProfile.goal,
    });

    await UserProfile.findOneAndUpdate(
      { clerkId: user.id },
      {
        currentWeight: validated.weight,
        dailyCaloriesGoal: newMacros.dailyCaloriesGoal,
        dailyProteinGoal: newMacros.dailyProteinGoal,
        dailyFatGoal: newMacros.dailyFatGoal,
        dailyCarbGoal: newMacros.dailyCarbGoal,
        dailyFiberGoal: newMacros.dailyFiberGoal,
        waterGoalMl: newMacros.waterGoalMl,
      }
    );

    const calorieDiff = newMacros.dailyCaloriesGoal - oldCalories;
    const proteinDiff = Math.round((newMacros.dailyProteinGoal - oldProtein) * 10) / 10;

    adaptiveUpdate = {
      recalculated: true,
      weightDiff: Math.round((validated.weight - existingProfile.currentWeight) * 10) / 10,
      newCalories: newMacros.dailyCaloriesGoal,
      calorieDiff,
      newProtein: newMacros.dailyProteinGoal,
      proteinDiff,
      newWaterMl: newMacros.waterGoalMl,
    };
  } else {
    await UserProfile.findOneAndUpdate(
      { clerkId: user.id },
      { currentWeight: validated.weight }
    );
  }

  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath("/profile");
  return JSON.parse(JSON.stringify({ weight, adaptiveUpdate }));
}

export async function getWeightHistory(days: number = 30) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = getLocalDateString(startDate);

  const logs = await WeightLog.find({
    clerkId: user.id,
    date: { $gte: startStr },
  })
    .sort({ date: 1 })
    .lean();

  return JSON.parse(JSON.stringify(logs));
}

export async function getWeightStats() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const today = getLocalDateString();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenStr = getLocalDateString(sevenDaysAgo);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyStr = getLocalDateString(thirtyDaysAgo);

  const [totalEntries, latestLog, recentLogs, monthOldLog, profile] =
    await Promise.all([
      WeightLog.countDocuments({ clerkId: user.id }),
      WeightLog.findOne({ clerkId: user.id }).sort({ date: -1 }).lean(),
      WeightLog.find({ clerkId: user.id, date: { $gte: thirtyStr } })
        .sort({ date: -1 })
        .lean(),
      WeightLog.findOne({ clerkId: user.id, date: { $lte: thirtyStr } })
        .sort({ date: -1 })
        .lean(),
      UserProfile.findOne({ clerkId: user.id }, { height: 1 }).lean(),
    ]);

  if (!latestLog || totalEntries === 0) return null;

  const latestWeight = (latestLog as unknown as IWeightLog).weight;
  const todayLog = (recentLogs as unknown as IWeightLog[]).find((l) => l.date === today);

  // Last 7 days
  const weekLogs = (recentLogs as unknown as IWeightLog[]).filter(
    (l) => l.date >= sevenStr,
  );
  const weekAvg =
    weekLogs.length > 0
      ? Math.round(
          (weekLogs.reduce((s, l) => s + l.weight, 0) / weekLogs.length) * 10,
        ) / 10
      : null;

  // Last 30 days
  const monthLogs = recentLogs as unknown as IWeightLog[];
  const monthAvg =
    monthLogs.length > 0
      ? Math.round(
          (monthLogs.reduce((s, l) => s + l.weight, 0) / monthLogs.length) * 10,
        ) / 10
      : null;

  // Weekly change
  const weekOldLog = (recentLogs as unknown as IWeightLog[]).find(
    (l) => l.date <= sevenStr,
  );
  const weeklyChange = weekOldLog
    ? Math.round((latestWeight - weekOldLog.weight) * 10) / 10
    : null;

  // Monthly change
  const monthlyChange = monthOldLog
    ? Math.round((latestWeight - (monthOldLog as unknown as IWeightLog).weight) * 10) / 10
    : null;

  // BMI
  const userHeight = (profile as unknown as IUserProfile | null)?.height;
  const heightM = userHeight ? userHeight / 100 : 1.7;
  const bmi = Math.round((latestWeight / (heightM * heightM)) * 10) / 10;

  return {
    todayWeight: todayLog?.weight ?? latestWeight,
    weekAvg,
    monthAvg,
    weeklyChange,
    monthlyChange,
    bmi,
    totalEntries,
  };
}

export async function deleteWeightLog(logId: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await WeightLog.findOneAndDelete({ _id: logId, clerkId: user.id });
  revalidatePath("/");
  revalidatePath("/progress");
}
