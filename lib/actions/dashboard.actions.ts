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

import { analyzeWeightTrend } from "@/lib/weight-prediction";
import { getLocalDateString } from "@/lib/utils";

export async function getDashboardData(dateStr?: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return null;

  const profile = (await UserProfile.findOne({
    clerkId: user.id,
  }).lean()) as IUserProfile | null;
  if (!profile) return { needsOnboarding: true };

  const today = dateStr || getLocalDateString();

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

  // Weekly chart data & weight logs for prediction (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyStr = getLocalDateString(thirtyDaysAgo);

  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);
  const oneYearAgoStr = getLocalDateString(oneYearAgo);

  const weekDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDates.push(getLocalDateString(d));
  }

  const [
    weekMeals,
    weekWeights,
    weekWorkouts,
    activeWorkoutDates,
    activeMealDates,
    monthWeights,
  ] = await Promise.all([
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
    WorkoutLog.find({ clerkId: user.id, date: { $gte: oneYearAgoStr } }, { date: 1 }).lean(),
    MealLog.find({ clerkId: user.id, date: { $gte: oneYearAgoStr } }, { date: 1 }).lean(),
    WeightLog.find({
      clerkId: user.id,
      date: { $gte: thirtyStr },
    })
      .sort({ date: 1 })
      .lean(),
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

  // DSA Hash Set for O(1) workout & meal streak calculation
  const activeDatesSet = new Set<string>();
  for (const w of activeWorkoutDates) activeDatesSet.add(w.date);
  for (const m of activeMealDates) activeDatesSet.add(m.date);

  let streak = 0;
  const checkDate = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = getLocalDateString(checkDate);
    if (activeDatesSet.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Weekly workout consistency
  const workoutDaysThisWeek = new Set(weekWorkouts.map((w) => w.date)).size;

  // ===== Phase 1: Smart Weight Prediction =====
  const weightPoints = monthWeights.map((w) => ({
    date: w.date,
    weight: w.weight,
  }));
  const weightPrediction = analyzeWeightTrend(
    weightPoints,
    profile.targetWeight
  );

  // ===== Phase 1: Daily Score (0-100) =====
  const calorieDiff = Math.abs(todayCalories - profile.dailyCaloriesGoal);
  const calorieTolerance = profile.dailyCaloriesGoal * 0.15;
  const caloriesHit = todayCalories > 0 && calorieDiff <= calorieTolerance;
  const proteinHit = todayProtein >= profile.dailyProteinGoal * 0.8;
  const waterHit = todayWaterMl >= profile.waterGoalMl * 0.8;
  const workoutHit = workouts.length > 0;
  const sleepHit = todaySleepHours !== null && todaySleepHours >= 6;
  const weightHit = weightLog !== null;

  const scoreBreakdown = [
    {
      label: "Calorie Target (±15%)",
      points: caloriesHit ? 25 : Math.min(25, Math.round((todayCalories / profile.dailyCaloriesGoal) * 25)),
      maxPoints: 25,
      done: caloriesHit,
    },
    {
      label: "Protein Target (≥80%)",
      points: proteinHit ? 20 : Math.min(20, Math.round((todayProtein / profile.dailyProteinGoal) * 20)),
      maxPoints: 20,
      done: proteinHit,
    },
    {
      label: "Water Goal (≥80%)",
      points: waterHit ? 20 : Math.min(20, Math.round((todayWaterMl / profile.waterGoalMl) * 20)),
      maxPoints: 20,
      done: waterHit,
    },
    {
      label: "Workout Session",
      points: workoutHit ? 15 : 0,
      maxPoints: 15,
      done: workoutHit,
    },
    {
      label: "Sleep Logged (≥6h)",
      points: sleepHit ? 10 : 0,
      maxPoints: 10,
      done: sleepHit,
    },
    {
      label: "Daily Weight Logged",
      points: weightHit ? 10 : 0,
      maxPoints: 10,
      done: weightHit,
    },
  ];

  const totalScore = scoreBreakdown.reduce((sum, item) => sum + item.points, 0);

  let grade = "Needs Work";
  let gradeEmoji = "⚡";
  if (totalScore >= 85) {
    grade = "Excellent";
    gradeEmoji = "🔥";
  } else if (totalScore >= 70) {
    grade = "Great";
    gradeEmoji = "🌟";
  } else if (totalScore >= 50) {
    grade = "Good";
    gradeEmoji = "👍";
  }

  const dailyScore = {
    score: totalScore,
    maxScore: 100,
    grade,
    gradeEmoji,
    breakdown: scoreBreakdown,
  };

  // ===== Phase 1: Today's Mission (Hero section) =====
  const currentHour = new Date().getHours();
  let greetingTime = "Good Morning";
  let primaryMission = "Log your breakfast to start today's mission!";
  let missionAction: "meal" | "water" | "workout" | "weight" | "sleep" = "meal";

  if (currentHour >= 12 && currentHour < 17) {
    greetingTime = "Good Afternoon";
  } else if (currentHour >= 17 && currentHour < 22) {
    greetingTime = "Good Evening";
  } else if (currentHour >= 22 || currentHour < 5) {
    greetingTime = "Night Owl Time";
  }

  // Contextual smart recommendation logic based on missing logs and time
  if (!weightLog && currentHour < 12) {
    primaryMission = "Log today's morning weight to keep predictions accurate!";
    missionAction = "weight";
  } else if (meals.length === 0) {
    primaryMission = "You haven't logged any meals today. Tap + Quick Add!";
    missionAction = "meal";
  } else if (todayWaterMl < profile.waterGoalMl * 0.5 && currentHour >= 12) {
    primaryMission = `Hydration checkpoint: You're at ${Math.round((todayWaterMl / profile.waterGoalMl) * 100)}% of your water target!`;
    missionAction = "water";
  } else if (!workouts.length && currentHour >= 16) {
    primaryMission = "Hit your workout target before the day ends!";
    missionAction = "workout";
  } else if (todaySleepHours === null && currentHour >= 21) {
    primaryMission = "Log last night's sleep duration!";
    missionAction = "sleep";
  } else {
    primaryMission = `You've completed ${scoreBreakdown.filter((b) => b.done).length}/6 daily habits! Keep it up!`;
  }

  const completedCount = scoreBreakdown.filter((b) => b.done).length;

  const todaysMission = {
    greetingTime,
    primaryMission,
    missionAction,
    completedCount,
    totalCount: 6,
    remainingCalories: Math.max(0, profile.dailyCaloriesGoal - todayCalories),
    remainingProtein: Math.max(0, Math.round((profile.dailyProteinGoal - todayProtein) * 10) / 10),
    remainingWaterMl: Math.max(0, profile.waterGoalMl - todayWaterMl),
  };

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
      todaysMission,
      dailyScore,
      weightPrediction,
    }),
  );
}

