"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import MealLog from "@/lib/database/models/meal-log.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import WaterLog from "@/lib/database/models/water-log.model";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import SleepLog from "@/lib/database/models/sleep-log.model";
import { currentUser } from "@clerk/nextjs/server";
import type {
  IMealLog,
  ISleepLog,
  IUserProfile,
  IWaterLog,
  IWeightLog,
  IWorkoutLog,
} from "@/types/fitness";

type DashboardWaterLog = IWaterLog & { amountMl?: number | string };
type DashboardSleepLog = ISleepLog & { quality?: number | string };

export async function getDashboardData() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = (await UserProfile.findOne({
    clerkId: user.id,
  }).lean()) as IUserProfile | null;
  if (!profile) return { needsOnboarding: true };

  const today = new Date().toISOString().split("T")[0];

  const [meals, weightLog, waterLog, workouts, sleepLog] = (await Promise.all([
    MealLog.find({ clerkId: user.id, date: today }).lean(),
    WeightLog.findOne({ clerkId: user.id, date: today }).lean(),
    WaterLog.findOne({ clerkId: user.id, date: today }).lean(),
    WorkoutLog.find({ clerkId: user.id, date: today }).lean(),
    SleepLog.findOne({ clerkId: user.id, date: today }).lean(),
  ])) as unknown as [
    IMealLog[],
    IWeightLog | null,
    DashboardWaterLog | null,
    IWorkoutLog[],
    DashboardSleepLog | null,
  ];

  // Today's nutrition totals
  let todayCalories = 0;
  let todayProtein = 0;
  let todayCarbs = 0;
  let todayFat = 0;
  let todayFiber = 0;

  for (const m of meals) {
    todayCalories += Number(m.totalCalories || 0);
    todayProtein += Number(m.totalProtein || 0);
    todayCarbs += Number(m.totalCarbs || 0);
    todayFat += Number(m.totalFat || 0);
    todayFiber += Number(m.totalFiber || 0);
  }

  // Water total: prefer totalMl field, fallback to summing entries
  const waterEntries =
    (waterLog?.entries as { amountMl: number }[] | undefined) || [];
  const todayWaterMl =
    Number(waterLog?.totalMl) ||
    (waterEntries.length > 0
      ? waterEntries.reduce((s, e) => s + Number(e.amountMl || 0), 0)
      : Number(waterLog?.amountMl) || 0);

  // Sleep total: prefer sessions aggregation
  const sleepSessions =
    (sleepLog?.sessions as
      | { totalHours: number; quality: number }[]
      | undefined) || [];
  const sleepHoursFromSessions = sleepSessions.length
    ? sleepSessions.reduce((s, ses) => s + Number(ses.totalHours || 0), 0)
    : null;
  const sleepQualityFromSessions = sleepSessions.length
    ? sleepSessions.reduce((s, ses) => s + Number(ses.quality || 0), 0) /
      sleepSessions.length
    : null;
  const todaySleepHours =
    Number(sleepLog?.totalHours) ||
    (sleepHoursFromSessions !== null
      ? Math.round(sleepHoursFromSessions * 10) / 10
      : (sleepLog?.totalHours ?? null));
  const todaySleepQuality =
    Number(sleepLog?.avgQuality) ||
    (sleepQualityFromSessions !== null
      ? Math.round(sleepQualityFromSessions * 10) / 10
      : (sleepLog?.quality ?? null));

  // Weekly chart data (last 7 days)
  const weekDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  const [weekMeals, weekWeights, weekWorkouts, activeWorkoutDates, activeMealDates] =
    await Promise.all([
      MealLog.find({
        clerkId: user.id,
        date: { $gte: weekDates[0], $lte: weekDates[6] },
      }).lean(),
      WeightLog.find({
        clerkId: user.id,
        date: { $gte: weekDates[0], $lte: weekDates[6] },
      })
        .sort({ date: 1 })
        .lean(),
      WorkoutLog.find({
        clerkId: user.id,
        date: { $gte: weekDates[0], $lte: weekDates[6] },
      }).lean(),
      WorkoutLog.find({ clerkId: user.id }, { date: 1 }).lean(),
      MealLog.find({ clerkId: user.id }, { date: 1 }).lean(),
    ]);

  // DSA Hash Map for O(1) daily meal aggregations
  const mealNutritionByDate = new Map<string, { calories: number; protein: number }>();
  for (const m of weekMeals) {
    const curr = mealNutritionByDate.get(m.date) || { calories: 0, protein: 0 };
    mealNutritionByDate.set(m.date, {
      calories: curr.calories + (Number(m.totalCalories) || 0),
      protein: curr.protein + (Number(m.totalProtein) || 0),
    });
  }

  // Build weekly calories chart
  const weeklyCaloriesChart = weekDates.map((date) => {
    const n = mealNutritionByDate.get(date) || { calories: 0, protein: 0 };
    return {
      date,
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      calories: n.calories,
      protein: n.protein,
    };
  });

  // Build weekly weight chart
  const weeklyWeightChart = weekWeights.map((w) => ({
    date: w.date,
    day: new Date(w.date).toLocaleDateString("en-US", { weekday: "short" }),
    weight: w.weight,
  }));

  // DSA Hash Set for O(1) workout & meal streak calculation (0 DB queries inside loop)
  const activeDatesSet = new Set<string>();
  for (const w of activeWorkoutDates) activeDatesSet.add(w.date);
  for (const m of activeMealDates) activeDatesSet.add(m.date);

  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (activeDatesSet.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Weekly workout consistency
  const workoutDaysThisWeek = new Set(weekWorkouts.map((w) => w.date)).size;

  return JSON.parse(
    JSON.stringify({
      needsOnboarding: false,
      profile: {
        name: profile.name,
        goal: profile.goal,
        currentWeight: profile.currentWeight,
        targetWeight: profile.targetWeight,
        dailyCaloriesGoal: profile.dailyCaloriesGoal,
        dailyProteinGoal: profile.dailyProteinGoal,
        dailyCarbGoal: profile.dailyCarbGoal,
        dailyFatGoal: profile.dailyFatGoal,
        dailyFiberGoal: profile.dailyFiberGoal,
        waterGoalMl: profile.waterGoalMl,
        workoutDaysPerWeek: profile.workoutDaysPerWeek,
      },
      today: {
        calories: Math.round(todayCalories),
        protein: Math.round(todayProtein * 10) / 10,
        carbs: Math.round(todayCarbs * 10) / 10,
        fat: Math.round(todayFat * 10) / 10,
        fiber: Math.round(todayFiber * 10) / 10,
        weight: weightLog?.weight ?? profile.currentWeight,
        waterMl: todayWaterMl,
        workoutDone: workouts.length > 0,
        workoutCount: workouts.length,
        sleepHours: todaySleepHours ?? null,
        sleepQuality: todaySleepQuality ?? null,
        mealCount: meals.length,
      },
      charts: {
        weeklyCalories: weeklyCaloriesChart,
        weeklyWeight: weeklyWeightChart,
      },
      streak,
      workoutDaysThisWeek,
    }),
  );
}
