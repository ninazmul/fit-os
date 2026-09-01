"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import MealLog from "@/lib/database/models/meal-log.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import WaterLog from "@/lib/database/models/water-log.model";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import SleepLog from "@/lib/database/models/sleep-log.model";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import { currentUser } from "@clerk/nextjs/server";
import { getLocalDateString } from "@/lib/utils";
import type { IUserProfile } from "@/types/fitness";

export interface AIAnalyticsData {
  healthScore: number;
  healthGrade: string;
  scoreBreakdown: {
    nutrition: number; // 0-100
    workouts: number; // 0-100
    recovery: number; // 0-100
    hydration: number; // 0-100
  };
  executiveSummary: string;
  keyStrengths: string[];
  growthAreas: string[];
  actionPlan: {
    step: number;
    title: string;
    description: string;
    impact: "High" | "Medium" | "Quick Win";
  }[];
  categorizedInsights: {
    id: string;
    category: "nutrition" | "training" | "recovery" | "longevity" | "habits";
    type: "critical" | "optimization" | "achievement" | "milestone";
    title: string;
    description: string;
    recommendation: string;
    metric?: string;
  }[];
  correlations: {
    title: string;
    observation: string;
    confidence: "High" | "Moderate";
  }[];
  isAIGenerated: boolean;
}

/** Fallback rule-based deep analytics calculation if Gemini API key is not present or fails */
function fallbackDeepAnalytics(
  profile: IUserProfile,
  meals: Array<{ totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number; date: string }>,
  workouts: Array<{ durationMinutes: number; caloriesBurned: number; date: string }>,
  weights: Array<{ weight: number; date: string }>,
  waterLogs: Array<{ totalMl?: number; amountMl?: number; entries?: Array<{ amountMl: number }> }>,
  sleepLogs: Array<{ totalHours?: number; quality?: number; sessions?: Array<{ totalHours: number; quality: number }> }>,
): AIAnalyticsData {
  // 1. Calculate component scores
  const calGoal = profile.dailyCaloriesGoal || 2000;
  const pGoal = profile.dailyProteinGoal || 140;
  const waterGoal = profile.waterGoalMl || 3000;
  const workoutTarget = profile.workoutDaysPerWeek || 4;

  const avgCalories = meals.length > 0 ? meals.reduce((s, m) => s + (Number(m.totalCalories) || 0), 0) / 7 : 0;
  const avgProtein = meals.length > 0 ? meals.reduce((s, m) => s + (Number(m.totalProtein) || 0), 0) / 7 : 0;

  // Nutrition Score
  const calAdherence = avgCalories > 0 ? Math.max(0, 100 - Math.abs(avgCalories - calGoal) / (calGoal * 0.01)) : 50;
  const proteinAdherence = avgProtein > 0 ? Math.min(100, (avgProtein / pGoal) * 100) : 50;
  const nutritionScore = Math.round(calAdherence * 0.5 + proteinAdherence * 0.5);

  // Workout Score
  const workoutDays = new Set(workouts.map((w) => w.date)).size;
  const workoutScore = Math.min(100, Math.round((workoutDays / Math.max(1, workoutTarget)) * 100));

  // Hydration Score
  let totalWater = 0;
  waterLogs.forEach((w) => {
    const entries = Array.isArray(w.entries) ? w.entries : [];
    const val = Number(w.totalMl) || (entries.length > 0 ? entries.reduce((s, e) => s + Number(e.amountMl || 0), 0) : Number(w.amountMl) || 0);
    totalWater += val;
  });
  const avgWater = totalWater / 7;
  const hydrationScore = Math.min(100, Math.round((avgWater / Math.max(1, waterGoal)) * 100));

  // Recovery Score
  let totalSleepHours = 0;
  let sleepCount = 0;
  sleepLogs.forEach((l) => {
    const sessions = Array.isArray(l.sessions) ? l.sessions : [];
    const val = Number(l.totalHours) || (sessions.length > 0 ? sessions.reduce((s, ses) => s + Number(ses.totalHours || 0), 0) : Number(l.totalHours) || 0);
    if (val > 0) {
      totalSleepHours += val;
      sleepCount++;
    }
  });
  const avgSleep = sleepCount > 0 ? totalSleepHours / sleepCount : 7;
  const recoveryScore = Math.min(100, Math.round((avgSleep / 8) * 100));

  // Overall Health Score
  const healthScore = Math.round(
    nutritionScore * 0.35 + workoutScore * 0.25 + recoveryScore * 0.2 + hydrationScore * 0.2
  );

  let healthGrade = "B+ Solid Consistency";
  if (healthScore >= 90) healthGrade = "A+ Elite Consistency";
  else if (healthScore >= 80) healthGrade = "A Optimal Progress";
  else if (healthScore >= 70) healthGrade = "B Good Momentum";
  else if (healthScore >= 60) healthGrade = "C Building Routine";
  else healthGrade = "Needs Attention";

  return {
    healthScore,
    healthGrade,
    scoreBreakdown: {
      nutrition: Math.min(100, Math.max(0, nutritionScore)),
      workouts: Math.min(100, Math.max(0, workoutScore)),
      recovery: Math.min(100, Math.max(0, recoveryScore)),
      hydration: Math.min(100, Math.max(0, hydrationScore)),
    },
    executiveSummary: `You maintain an overall ${healthScore}/100 fitness score. Your workout consistency is at ${workoutDays}/${workoutTarget} days/week with average daily protein intake of ${Math.round(avgProtein)}g against your ${pGoal}g goal.`,
    keyStrengths: [
      `Workout routine active with ${workoutDays} sessions logged this week`,
      `Macro tracking adherence covering ${meals.length} distinct meal entries`,
      `Target daily water baseline established at ${waterGoal}ml`,
    ],
    growthAreas: [
      avgProtein < pGoal ? `Increase daily protein intake by ~${Math.round(pGoal - avgProtein)}g` : "Maintain protein distribution evenly across 3-4 meals",
      avgSleep < 7 ? "Increase sleep duration towards 7.5-8.0 hours for nervous system recovery" : "Keep consistent bedtime schedule on weekends",
      hydrationScore < 80 ? "Drink 500ml upon waking to jumpstart hydration" : "Maintain electrolyte balance during workout sessions",
    ],
    actionPlan: [
      {
        step: 1,
        title: "Hit Morning Protein Anchor",
        description: "Consume 30-40g of protein within 90 minutes of waking (e.g. 3 whole eggs + 1 cup Greek yogurt or protein oats).",
        impact: "High",
      },
      {
        step: 2,
        title: "Consistent Workout Timing",
        description: "Schedule your planned workout sessions at the same time window to reinforce neural habit loops.",
        impact: "High",
      },
      {
        step: 3,
        title: "Pre-Hydration Protocol",
        description: "Keep a 1-liter bottle at your desk and finish 2 bottles before 4:00 PM.",
        impact: "Quick Win",
      },
    ],
    categorizedInsights: [
      {
        id: "nutr-protein",
        category: "nutrition",
        type: avgProtein >= pGoal ? "achievement" : "optimization",
        title: avgProtein >= pGoal ? "Protein Target Satisfied" : "Protein Intake Optimization",
        description: `Averaging ${Math.round(avgProtein)}g/day compared to ${pGoal}g target.`,
        recommendation: "Ensure high-leucine protein sources (chicken, eggs, lentils, whey) in post-workout meals.",
        metric: `${Math.round(avgProtein)}g / ${pGoal}g`,
      },
      {
        id: "train-consistency",
        category: "training",
        type: workoutDays >= workoutTarget ? "milestone" : "critical",
        title: workoutDays >= workoutTarget ? "Training Frequency Milestone" : "Training Frequency Target",
        description: `Completed ${workoutDays} of ${workoutTarget} planned sessions this week.`,
        recommendation: "Focus on compound movements (Squat, Deadlift, Bench/Press, Pull-ups) for maximum stimulus per minute.",
        metric: `${workoutDays}/${workoutTarget} Days`,
      },
      {
        id: "rec-sleep",
        category: "recovery",
        type: avgSleep >= 7 ? "achievement" : "optimization",
        title: "Sleep & Nervous System Recovery",
        description: `Averaging ${Math.round(avgSleep * 10) / 10} hours per night.`,
        recommendation: "Dim screens 45 minutes before sleep and maintain cool bedroom temperature (~19°C / 66°F).",
        metric: `${Math.round(avgSleep * 10) / 10} hrs/night`,
      },
      {
        id: "long-composition",
        category: "longevity",
        type: "optimization",
        title: "Metabolic Longevity Baseline",
        description: `Calculated BMR of ${profile.currentWeight ? Math.round(profile.currentWeight * 22) : 1600} kcal/day supports steady energy.`,
        recommendation: "Pair strength training with 8,000–10,000 daily steps for peak insulin sensitivity and cardiovascular health.",
        metric: "Active",
      },
    ],
    correlations: [
      {
        title: "Sleep Duration & Energy",
        observation: "Sufficient sleep duration correlates directly with higher workout energy and stable appetite control.",
        confidence: "High",
      },
      {
        title: "Hydration & Weight Fluctuation",
        observation: "Consistent water intake reduces water retention spikes and provides smoother scale weight trends.",
        confidence: "High",
      },
    ],
    isAIGenerated: false,
  };
}

/** Call Gemini 1.5/2.0 Flash to generate rich AI analytics with health score & action plan */
export async function generateDeepAIAnalytics(): Promise<AIAnalyticsData> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const profile = (await UserProfile.findOne({ clerkId: user.id }).lean()) as IUserProfile | null;
  if (!profile) throw new Error("Profile not found");

  const today = new Date();
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);
  const startStr = getLocalDateString(fourteenDaysAgo);

  const [meals, weights, waterLogs, workouts, sleepLogs, measurements] = await Promise.all([
    MealLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
    WeightLog.find({ clerkId: user.id, date: { $gte: startStr } }).sort({ date: 1 }).lean(),
    WaterLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
    WorkoutLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
    SleepLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
    BodyMeasurement.find({ clerkId: user.id }).sort({ date: -1 }).limit(5).lean(),
  ]);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return fallbackDeepAnalytics(
      profile,
      meals as never,
      workouts as never,
      weights as never,
      waterLogs as never,
      sleepLogs as never
    );
  }

  try {
    const prompt = `You are a world-class elite sports scientist, metabolic physician, and personal nutrition coach.
Analyze the user's recent 14-day biometric data and generate a deep, actionable, comprehensive health analytics report.

User Profile:
- Name: ${profile.name || "User"}
- Gender: ${profile.gender}, Age: ${profile.age}, Height: ${profile.height} cm
- Current Weight: ${profile.currentWeight} kg, Target Weight: ${profile.targetWeight} kg
- Goal: ${profile.goal}
- Daily Goals: Calories: ${profile.dailyCaloriesGoal} kcal, Protein: ${profile.dailyProteinGoal}g, Water: ${profile.waterGoalMl}ml, Workout Target: ${profile.workoutDaysPerWeek} days/week

14-Day Activity Data Summary:
- Meals logged: ${meals.length} entries. Average daily calories: ${
      meals.length > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.totalCalories) || 0), 0) / 14) : 0
    } kcal. Average daily protein: ${
      meals.length > 0 ? Math.round(meals.reduce((s, m) => s + (Number(m.totalProtein) || 0), 0) / 14) : 0
    }g.
- Workouts logged: ${workouts.length} sessions. Total workout minutes: ${workouts.reduce((s, w) => s + (Number(w.durationMinutes) || 0), 0)} min.
- Weight logs: ${weights.length} entries. Latest: ${weights.length > 0 ? weights[weights.length - 1].weight : profile.currentWeight} kg.
- Sleep logs: ${sleepLogs.length} nights recorded.
- Recent Body Measurements: ${measurements.length > 0 ? JSON.stringify(measurements[0]) : "None"}.

Requirements:
1. Calculate a rigorous Health Score (0–100) and Health Grade (e.g. "A+ Elite Consistency", "A Optimal Progress", "B+ Solid Consistency", "C Building Momentum").
2. Component score breakdowns for Nutrition, Workouts, Recovery, Hydration (0–100 each).
3. Executive Summary: 2-3 concise sentences synthesizing whole-body progress.
4. Key Strengths (3 bullet points) and Growth Areas (3 bullet points).
5. 3-Step Action Plan for the next 7 days with practical specifics.
6. Categorized Insights across 'nutrition', 'training', 'recovery', 'longevity', 'habits' with type 'critical' | 'optimization' | 'achievement' | 'milestone'.
7. Interesting correlation observations between their metrics.

Output strictly valid JSON matching this schema:
{
  "healthScore": 88,
  "healthGrade": "A Optimal Progress",
  "scoreBreakdown": {
    "nutrition": 85,
    "workouts": 92,
    "recovery": 80,
    "hydration": 90
  },
  "executiveSummary": "...",
  "keyStrengths": ["...", "...", "..."],
  "growthAreas": ["...", "...", "..."],
  "actionPlan": [
    { "step": 1, "title": "...", "description": "...", "impact": "High" },
    { "step": 2, "title": "...", "description": "...", "impact": "High" },
    { "step": 3, "title": "...", "description": "...", "impact": "Quick Win" }
  ],
  "categorizedInsights": [
    {
      "id": "nutr-1",
      "category": "nutrition",
      "type": "optimization",
      "title": "...",
      "description": "...",
      "recommendation": "...",
      "metric": "..."
    }
  ],
  "correlations": [
    {
      "title": "...",
      "observation": "...",
      "confidence": "High"
    }
  ]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      console.warn("Gemini API error in deep analytics, using fallback engine");
      return fallbackDeepAnalytics(
        profile,
        meals as never,
        workouts as never,
        weights as never,
        waterLogs as never,
        sleepLogs as never
      );
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return fallbackDeepAnalytics(
        profile,
        meals as never,
        workouts as never,
        weights as never,
        waterLogs as never,
        sleepLogs as never
      );
    }

    const parsed = JSON.parse(text);
    return {
      healthScore: Math.min(100, Math.max(0, Number(parsed.healthScore) || 75)),
      healthGrade: parsed.healthGrade || "A Optimal Progress",
      scoreBreakdown: {
        nutrition: Math.min(100, Math.max(0, Number(parsed.scoreBreakdown?.nutrition) || 75)),
        workouts: Math.min(100, Math.max(0, Number(parsed.scoreBreakdown?.workouts) || 75)),
        recovery: Math.min(100, Math.max(0, Number(parsed.scoreBreakdown?.recovery) || 75)),
        hydration: Math.min(100, Math.max(0, Number(parsed.scoreBreakdown?.hydration) || 75)),
      },
      executiveSummary: parsed.executiveSummary || "Progress is steady across nutrition and training.",
      keyStrengths: Array.isArray(parsed.keyStrengths) ? parsed.keyStrengths : [],
      growthAreas: Array.isArray(parsed.growthAreas) ? parsed.growthAreas : [],
      actionPlan: Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [],
      categorizedInsights: Array.isArray(parsed.categorizedInsights) ? parsed.categorizedInsights : [],
      correlations: Array.isArray(parsed.correlations) ? parsed.correlations : [],
      isAIGenerated: true,
    };
  } catch (err) {
    console.error("Error in generateDeepAIAnalytics:", err);
    return fallbackDeepAnalytics(
      profile,
      meals as never,
      workouts as never,
      weights as never,
      waterLogs as never,
      sleepLogs as never
    );
  }
}

/** Ask AI Coach interactive Q&A assistant */
export async function askAICoach(question: string): Promise<{ answer: string; suggestedPills: string[] }> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const profile = (await UserProfile.findOne({ clerkId: user.id }).lean()) as IUserProfile | null;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey || !profile) {
    return {
      answer: `Based on your goal to ${profile?.goal?.replace("_", " ") || "improve fitness"} with a target of ${profile?.dailyCaloriesGoal || 2000} calories and ${profile?.dailyProteinGoal || 140}g protein: consistency with progressive resistance training, a modest caloric balance, and 7-8 hours of sleep is the fastest path forward.`,
      suggestedPills: [
        "How can I hit my protein goal with home cooking?",
        "What is the best workout split for my goal?",
        "How can I prevent energy crashes in the afternoon?",
      ],
    };
  }

  try {
    const prompt = `You are FitOS AI Coach, a supportive, highly knowledgeable personal fitness, nutrition, and metabolic recovery coach.
User Profile:
- Goal: ${profile.goal}
- Weight: ${profile.currentWeight}kg (Target: ${profile.targetWeight}kg), Height: ${profile.height}cm, Age: ${profile.age}
- Daily Targets: ${profile.dailyCaloriesGoal} kcal, ${profile.dailyProteinGoal}g Protein, ${profile.waterGoalMl}ml Water, ${profile.workoutDaysPerWeek} workouts/wk

User Question: "${question}"

Instructions:
1. Provide a direct, actionable, evidence-based answer tailored specifically to their stats and goals (2-3 concise paragraphs, engaging tone, with bullet points if helpful).
2. Suggest 3 relevant follow-up questions they can ask next.

Output strictly valid JSON:
{
  "answer": "...",
  "suggestedPills": ["...", "...", "..."]
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Gemini API error");
    }

    const data = await res.json();
    const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

    return {
      answer: parsed.answer || "Maintain steady progressive overload, consistent protein, and proper recovery.",
      suggestedPills: Array.isArray(parsed.suggestedPills) ? parsed.suggestedPills : [],
    };
  } catch (err) {
    console.error("Ask AI Coach error:", err);
    return {
      answer: `To optimize for your ${profile.goal?.replace("_", " ")} goal: aim for ${profile.dailyProteinGoal}g protein, hit your ${profile.workoutDaysPerWeek} weekly training sessions, and stay within ${profile.dailyCaloriesGoal} kcal.`,
      suggestedPills: [
        "How to avoid late-night cravings?",
        "Best post-workout meal options?",
        "How to break through a weight loss plateau?",
      ],
    };
  }
}
