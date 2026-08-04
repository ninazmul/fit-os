"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import MealLog from "@/lib/database/models/meal-log.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import WaterLog from "@/lib/database/models/water-log.model";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import SleepLog from "@/lib/database/models/sleep-log.model";
import { currentUser } from "@clerk/nextjs/server";

export async function getDashboardData() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = await UserProfile.findOne({ clerkId: user.id });
  if (!profile) return { needsOnboarding: true };

  const today = new Date().toISOString().split("T")[0];

  // Fetch today's data in parallel
  const [meals, weightLog, waterLog, workouts, sleepLog] = await Promise.all([
    MealLog.find({ clerkId: user.id, date: today }),
    WeightLog.findOne({ clerkId: user.id, date: today }),
    WaterLog.findOne({ clerkId: user.id, date: today }),
    WorkoutLog.find({ clerkId: user.id, date: today }),
    SleepLog.findOne({ clerkId: user.id, date: today }),
  ]);

  // Today's nutrition
  const todayCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
  const todayProtein = meals.reduce((s, m) => s + m.totalProtein, 0);
  const todayCarbs = meals.reduce((s, m) => s + m.totalCarbs, 0);
  const todayFat = meals.reduce((s, m) => s + m.totalFat, 0);
  const todayFiber = meals.reduce((s, m) => s + m.totalFiber, 0);

  // Water total: prefer totalMl field, fallback to summing entries, legacy amountMl
  const waterEntries =
    (waterLog?.entries as { amountMl: number }[] | undefined) || [];
  const todayWaterMl =
    Number(waterLog?.totalMl) ||
    (waterEntries.length > 0
      ? waterEntries.reduce((s, e) => s + Number(e.amountMl || 0), 0)
      : Number(waterLog?.amountMl) || 0);

  // Sleep total: prefer sessions aggregation, fallback to legacy fields
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

  const [weekMeals, weekWeights, weekWorkouts] = await Promise.all([
    MealLog.find({
      clerkId: user.id,
      date: { $gte: weekDates[0], $lte: weekDates[6] },
    }),
    WeightLog.find({
      clerkId: user.id,
      date: { $gte: weekDates[0], $lte: weekDates[6] },
    }).sort({ date: 1 }),
    WorkoutLog.find({
      clerkId: user.id,
      date: { $gte: weekDates[0], $lte: weekDates[6] },
    }),
  ]);

  // Build weekly calories chart
  const weeklyCaloriesChart = weekDates.map((date) => {
    const dayMeals = weekMeals.filter((m) => m.date === date);
    return {
      date,
      day: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      calories: dayMeals.reduce((s, m) => s + m.totalCalories, 0),
      protein: dayMeals.reduce((s, m) => s + m.totalProtein, 0),
    };
  });

  // Build weekly weight chart
  const weeklyWeightChart = weekWeights.map((w) => ({
    date: w.date,
    day: new Date(w.date).toLocaleDateString("en-US", { weekday: "short" }),
    weight: w.weight,
  }));

  // Workout streak
  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const hasWorkout = await WorkoutLog.findOne({
      clerkId: user.id,
      date: dateStr,
    });
    const hasMeal = await MealLog.findOne({ clerkId: user.id, date: dateStr });
    if (hasWorkout || hasMeal) {
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
