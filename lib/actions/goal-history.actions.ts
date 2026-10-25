"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import GoalHistory from "@/lib/database/models/goal-history.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import MealLog from "@/lib/database/models/meal-log.model";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { IUserProfile, IGoalHistory, PrimaryGoal } from "@/types/fitness";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface GoalCelebrationStats {
  isGoalAchieved: boolean;
  userName: string;
  goal: PrimaryGoal;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  weightChange: number;
  daysActive: number;
  totalWorkoutsLogged: number;
  totalMealsLogged: number;
  measurementsSummary: {
    waistChange?: number;
    chestChange?: number;
    hipChange?: number;
  };
  startDate: string;
  headline: string;
  achievementBadge: string;
}

export interface CompleteGoalInput {
  nextGoal: PrimaryGoal;
  nextTargetWeight: number;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function goalHeadline(goal: PrimaryGoal, change: number): string {
  const abs = Math.abs(Math.round(change * 10) / 10);
  if (goal === "lose_weight") return `Lost ${abs} kg — Goal Crushed! 🔥`;
  if (goal === "gain_muscle") return `Gained ${abs} kg Muscle — Beast Mode! 💪`;
  return `Maintained Weight — Consistency Wins! ⚖️`;
}

function goalBadge(goal: PrimaryGoal, daysActive: number): string {
  if (daysActive >= 180) return "🏆 Champion";
  if (daysActive >= 90) return "🥇 Goal Crusher";
  if (daysActive >= 30) return "🥈 Achiever";
  if (goal === "lose_weight") return "🔥 Fat Burner";
  if (goal === "gain_muscle") return "💪 Muscle Builder";
  return "⚖️ Balanced";
}

// ────────────────────────────────────────────────────────────
// 1. getGoalCelebrationStats()
//    Checks if the user achieved their goal and computes
//    journey stats for the celebration modal.
// ────────────────────────────────────────────────────────────

export async function getGoalCelebrationStats(): Promise<GoalCelebrationStats | null> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = (await UserProfile.findOne({
    clerkId: user.id,
  }).lean()) as IUserProfile | null;
  if (!profile) return null;

  const curW = profile.currentWeight;
  const tgtW = profile.targetWeight;
  const goal = profile.goal as PrimaryGoal;

  // Check if goal is actually achieved
  let achieved = false;
  if (goal === "lose_weight" && curW <= tgtW) achieved = true;
  else if (goal === "gain_muscle" && curW >= tgtW) achieved = true;
  else if (goal === "maintain" && Math.abs(curW - tgtW) <= 1) achieved = true;

  if (!achieved) return null;

  // Find earliest weight log to determine journey start
  const earliestWeight = await WeightLog.findOne({ clerkId: user.id })
    .sort({ date: 1 })
    .lean();
  const startDate =
    earliestWeight && typeof earliestWeight === "object" && "date" in earliestWeight
      ? (earliestWeight.date as string)
      : (profile.createdAt
          ? new Date(profile.createdAt).toISOString().slice(0, 10)
          : todayStr());

  const startWeight =
    earliestWeight && typeof earliestWeight === "object" && "weight" in earliestWeight
      ? (earliestWeight.weight as number)
      : curW;

  const startMs = new Date(startDate).getTime();
  const nowMs = Date.now();
  const daysActive = Math.max(1, Math.round((nowMs - startMs) / 86400000));

  // Count totals
  const [totalWorkouts, totalMeals] = await Promise.all([
    WorkoutLog.countDocuments({ clerkId: user.id }),
    MealLog.countDocuments({ clerkId: user.id }),
  ]);

  // Body measurement deltas (earliest vs latest)
  const [earliestMeasurement, latestMeasurement] = await Promise.all([
    BodyMeasurement.findOne({ clerkId: user.id }).sort({ date: 1 }).lean(),
    BodyMeasurement.findOne({ clerkId: user.id }).sort({ date: -1 }).lean(),
  ]);

  type MeasurementDoc = { waist?: number; chest?: number; hip?: number };
  const earliest = earliestMeasurement as MeasurementDoc | null;
  const latest = latestMeasurement as MeasurementDoc | null;

  const measurementsSummary: GoalCelebrationStats["measurementsSummary"] = {};
  if (earliest && latest) {
    if (earliest.waist != null && latest.waist != null)
      measurementsSummary.waistChange =
        Math.round((latest.waist - earliest.waist) * 10) / 10;
    if (earliest.chest != null && latest.chest != null)
      measurementsSummary.chestChange =
        Math.round((latest.chest - earliest.chest) * 10) / 10;
    if (earliest.hip != null && latest.hip != null)
      measurementsSummary.hipChange =
        Math.round((latest.hip - earliest.hip) * 10) / 10;
  }

  const weightChange = Math.round((curW - startWeight) * 10) / 10;
  const headline = goalHeadline(goal, weightChange);
  const achievementBadge = goalBadge(goal, daysActive);

  return {
    isGoalAchieved: true,
    userName: profile.name || user.firstName || "Champ",
    goal,
    startWeight,
    currentWeight: curW,
    targetWeight: tgtW,
    weightChange,
    daysActive,
    totalWorkoutsLogged: totalWorkouts,
    totalMealsLogged: totalMeals,
    measurementsSummary,
    startDate,
    headline,
    achievementBadge,
  };
}

// ────────────────────────────────────────────────────────────
// 2. completeAndArchiveGoal()
//    Archives the current goal, cleans old data, and sets
//    the next goal on the user profile.
// ────────────────────────────────────────────────────────────

export async function completeAndArchiveGoal(
  stats: GoalCelebrationStats,
  nextGoal: CompleteGoalInput,
) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const today = todayStr();

  // 1. Archive: Create GoalHistory document
  await GoalHistory.create({
    clerkId: user.id,
    goal: stats.goal,
    startDate: stats.startDate,
    completedDate: today,
    startWeight: stats.startWeight,
    achievedWeight: stats.currentWeight,
    targetWeight: stats.targetWeight,
    weightChange: stats.weightChange,
    daysActive: stats.daysActive,
    totalWorkoutsLogged: stats.totalWorkoutsLogged,
    totalMealsLogged: stats.totalMealsLogged,
    measurementsSummary: stats.measurementsSummary,
    headline: stats.headline,
    achievementBadge: stats.achievementBadge,
  });

  // 2. Database Cleanup: Remove old MealLogs (before today)
  await MealLog.deleteMany({
    clerkId: user.id,
    date: { $lt: today },
  });

  // 3. Database Cleanup: Keep only latest BodyMeasurement
  const latestMeasurement = await BodyMeasurement.findOne({
    clerkId: user.id,
  })
    .sort({ date: -1 })
    .lean();

  if (latestMeasurement && "_id" in latestMeasurement) {
    await BodyMeasurement.deleteMany({
      clerkId: user.id,
      _id: { $ne: latestMeasurement._id },
    });
  }

  // 4. Database Cleanup: Keep only latest WeightLog
  const latestWeightLog = await WeightLog.findOne({
    clerkId: user.id,
  })
    .sort({ date: -1 })
    .lean();

  if (latestWeightLog && "_id" in latestWeightLog) {
    await WeightLog.deleteMany({
      clerkId: user.id,
      _id: { $ne: latestWeightLog._id },
    });
  }

  // 5. Update UserProfile with next goal
  await UserProfile.findOneAndUpdate(
    { clerkId: user.id },
    {
      $set: {
        goal: nextGoal.nextGoal,
        targetWeight: Math.max(
          20,
          Math.round(nextGoal.nextTargetWeight * 10) / 10,
        ),
      },
    },
  );

  // 6. Revalidate affected paths
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/diet");
  revalidatePath("/analytics");
  revalidatePath("/progress");
}

// ────────────────────────────────────────────────────────────
// 3. getGoalHistory()
//    Returns all archived milestones for the signed-in user.
// ────────────────────────────────────────────────────────────

export async function getGoalHistory(): Promise<IGoalHistory[]> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return [];

  const milestones = await GoalHistory.find({ clerkId: user.id })
    .sort({ completedDate: -1 })
    .lean();

  return JSON.parse(JSON.stringify(milestones)) as IGoalHistory[];
}
