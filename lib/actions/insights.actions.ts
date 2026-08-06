"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import MealLog from "@/lib/database/models/meal-log.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import WaterLog from "@/lib/database/models/water-log.model";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import SleepLog from "@/lib/database/models/sleep-log.model";
import { currentUser } from "@clerk/nextjs/server";
import type { AIInsight, IUserProfile } from "@/types/fitness";

/** Rule-based AI insights engine — evaluates recent data to generate actionable tips */
export async function generateInsights(): Promise<AIInsight[]> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return [];

  const profile = (await UserProfile.findOne({
    clerkId: user.id,
  }).lean()) as IUserProfile | null;
  if (!profile) return [];

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const startStr = sevenDaysAgo.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  // Fetch last 7 days of data
  const [meals, weights, waterLogs, workouts, sleepLogs] = await Promise.all([
    MealLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
    WeightLog.find({ clerkId: user.id, date: { $gte: startStr } }).sort({
      date: 1,
    }).lean(),
    WaterLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
    WorkoutLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
    SleepLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
  ]);

  const insights: AIInsight[] = [];

  // Protein insight
  const avgProtein =
    meals.length > 0 ? meals.reduce((s, m) => s + m.totalProtein, 0) / 7 : 0;
  if (avgProtein > 0 && avgProtein < profile.dailyProteinGoal * 0.8) {
    insights.push({
      id: "low-protein",
      type: "warning",
      title: "Protein Intake Below Target",
      description: `Your average daily protein is ${Math.round(avgProtein)}g, which is below your ${profile.dailyProteinGoal}g target. Try adding more lean meats, eggs, or dal to your meals.`,
      actionableText: "Log a high-protein meal",
    });
  } else if (avgProtein >= profile.dailyProteinGoal) {
    insights.push({
      id: "protein-on-track",
      type: "success",
      title: "Protein Intake On Track",
      description: `Great job! You're averaging ${Math.round(avgProtein)}g protein per day, meeting your ${profile.dailyProteinGoal}g target.`,
    });
  }

  // Calorie insight
  const avgCalories =
    meals.length > 0 ? meals.reduce((s, m) => s + m.totalCalories, 0) / 7 : 0;
  if (avgCalories > 0) {
    const diff = avgCalories - profile.dailyCaloriesGoal;
    if (diff > 300) {
      insights.push({
        id: "high-calories",
        type: "warning",
        title: "Calorie Intake Exceeding Target",
        description: `You're averaging ${Math.round(avgCalories)} calories/day — about ${Math.round(diff)} over your ${profile.dailyCaloriesGoal} target.`,
      });
    } else if (Math.abs(diff) <= 300) {
      insights.push({
        id: "calories-on-track",
        type: "success",
        title: "Average Calories Within Target",
        description: `Your average intake of ${Math.round(avgCalories)} cal/day is within range of your ${profile.dailyCaloriesGoal} cal target.`,
      });
    }
  }

  // Weight trend insight
  if (weights.length >= 2) {
    const firstWeight = weights[0].weight;
    const lastWeight = weights[weights.length - 1].weight;
    const weeklyChange = lastWeight - firstWeight;

    if (profile.goal === "lose_weight" && weeklyChange < -1.5) {
      insights.push({
        id: "fast-weight-loss",
        type: "warning",
        title: "Losing Weight Too Fast",
        description: `You've lost ${Math.abs(Math.round(weeklyChange * 10) / 10)}kg this week. A safe rate is 0.5-1kg/week. Consider increasing calories slightly.`,
      });
    } else if (profile.goal === "lose_weight" && weeklyChange < 0) {
      insights.push({
        id: "healthy-weight-loss",
        type: "success",
        title: "Healthy Weight Loss Progress",
        description: `You've lost ${Math.abs(Math.round(weeklyChange * 10) / 10)}kg this week. Keep it up!`,
      });
    }

    // Estimated goal date
    if (weeklyChange !== 0) {
      const remaining = Math.abs(lastWeight - profile.targetWeight);
      const weeksToGoal = Math.ceil(remaining / Math.abs(weeklyChange));
      if (weeksToGoal > 0 && weeksToGoal < 200) {
        const goalDate = new Date();
        goalDate.setDate(goalDate.getDate() + weeksToGoal * 7);
        insights.push({
          id: "goal-estimate",
          type: "info",
          title: "Estimated Goal Completion",
          description: `At your current rate, you'll reach ${profile.targetWeight}kg by approximately ${goalDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`,
        });
      }
    }
  }

  // Water insight
  // Build per-day totals (legacy amountMl + new totalMl + sessions summation)
  const waterByDay = new Map<string, number>();
  waterLogs.forEach((w) => {
    const entries = Array.isArray(w.entries)
      ? (w.entries as { amountMl: number }[])
      : [];
    const total =
      Number(w.totalMl) ||
      (entries.length > 0
        ? entries.reduce((s, e) => s + Number(e.amountMl || 0), 0)
        : Number(w.amountMl) || 0);
    waterByDay.set(w.date, (waterByDay.get(w.date) || 0) + total);
  });
  const waterDays = Array.from(waterByDay.values());
  const avgWater =
    waterDays.length > 0 ? waterDays.reduce((s, v) => s + v, 0) / 7 : 0;
  if (avgWater > 0 && avgWater >= profile.waterGoalMl * 0.9) {
    insights.push({
      id: "water-good",
      type: "success",
      title: "Water Intake Has Improved",
      description: `You're averaging ${Math.round(avgWater)}ml/day — close to or exceeding your ${profile.waterGoalMl}ml goal. Well done!`,
    });
  } else if (avgWater > 0 && avgWater < profile.waterGoalMl * 0.6) {
    insights.push({
      id: "water-low",
      type: "warning",
      title: "Drink More Water",
      description: `You're only averaging ${Math.round(avgWater)}ml/day. Your goal is ${profile.waterGoalMl}ml. Try keeping a water bottle nearby.`,
      actionableText: "Log water now",
    });
  }

  // Workout consistency
  const workoutDays = new Set(workouts.map((w) => w.date)).size;
  if (workoutDays >= profile.workoutDaysPerWeek) {
    insights.push({
      id: "workout-consistent",
      type: "success",
      title: "Workout Consistency Increased",
      description: `You've worked out ${workoutDays} days this week, meeting your ${profile.workoutDaysPerWeek}-day goal. Amazing consistency!`,
    });
  } else if (workoutDays > 0 && workoutDays < profile.workoutDaysPerWeek) {
    insights.push({
      id: "workout-behind",
      type: "tip",
      title: "Workout Goal Not Yet Met",
      description: `You've completed ${workoutDays}/${profile.workoutDaysPerWeek} workout days this week. ${profile.workoutDaysPerWeek - workoutDays} more to go!`,
      actionableText: "Start a workout",
    });
  }

  // Sleep insight
  // Build per-day totals from sessions and legacy fields
  const sleepByDay = new Map<string, number>();
  sleepLogs.forEach((l) => {
    const sessions = Array.isArray(l.sessions)
      ? (l.sessions as { totalHours: number }[])
      : [];
    const total =
      Number(l.totalHours) ||
      (sessions.length > 0
        ? sessions.reduce((s, ses) => s + Number(ses.totalHours || 0), 0)
        : Number(l.totalHours) || 0);
    sleepByDay.set(l.date, (sleepByDay.get(l.date) || 0) + total);
  });
  const sleepDayTotals = Array.from(sleepByDay.values());
  const avgSleep =
    sleepDayTotals.length > 0
      ? sleepDayTotals.reduce((s, v) => s + v, 0) / sleepDayTotals.length
      : 0;
  if (avgSleep > 0 && avgSleep < 6) {
    insights.push({
      id: "sleep-low",
      type: "warning",
      title: "Sleep Duration Below Recommended",
      description: `You're averaging ${Math.round(avgSleep * 10) / 10} hours of sleep. Adults need 7-9 hours for optimal recovery.`,
    });
  }

  // Today check
  const todayMeals = meals.filter((m) => m.date === todayStr);
  if (todayMeals.length === 0) {
    insights.push({
      id: "no-meals-today",
      type: "tip",
      title: "No Meals Logged Today",
      description:
        "Start tracking today's meals to stay on top of your nutrition goals.",
      actionableText: "Log a meal",
    });
  }

  return insights;
}
