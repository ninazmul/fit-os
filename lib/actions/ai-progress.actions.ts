"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import SleepLog from "@/lib/database/models/sleep-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { getLocalDateString } from "@/lib/utils";
import type { IUserProfile } from "@/types/fitness";

export interface AIProgressAuditData {
  trajectory: {
    predictedGoalDate: string | null;
    daysToGoal: number | null;
    weeklyVelocityKg: number;
    confidencePct: number;
    plateauRisk: "Low" | "Moderate" | "Elevated";
    assessment: string;
    advice: string;
  };
  recomposition: {
    status: "Active Recomposition" | "Fat Loss Primed" | "Lean Mass Building" | "Steady Maintenance";
    waistTrendCm: number;
    chestTrendCm: number;
    hipTrendCm: number;
    muscleRetentionScore: number; // 0-100
    summary: string;
    targetFocusArea: string;
  };
  recoveryIndex: {
    score: number; // 0-100
    readiness: "Peak Performance" | "Optimal Recovery" | "Moderate Fatigue" | "High Rest Needed";
    sleepToWorkoutCorrelation: string;
    actionTip: string;
  };
  milestones: {
    title: string;
    target: string;
    current: string;
    progressPct: number;
    projectedDate: string;
  }[];
  isAIGenerated: boolean;
}

/** Fallback rule-based progress audit if Gemini is unavailable */
function fallbackProgressAudit(
  profile: IUserProfile,
  weights: Array<{ weight: number; date: string }>,
  measurements: Array<{ waist?: number; chest?: number; hip?: number; arm?: number; date: string }>,
  workouts: Array<{ date: string; durationMinutes?: number }>,
  sleepLogs: Array<{ totalHours?: number; quality?: number; sessions?: Array<{ totalHours: number }> }>
): AIProgressAuditData {
  const currentW = weights.length > 0 ? weights[weights.length - 1].weight : profile.currentWeight || 75;
  const targetW = profile.targetWeight || 70;
  const diff = currentW - targetW;

  let weeklyVelocity = 0;
  if (weights.length >= 2) {
    const oldest = weights[0].weight;
    const days = Math.max(1, (new Date(weights[weights.length - 1].date).getTime() - new Date(weights[0].date).getTime()) / (1000 * 60 * 60 * 24));
    weeklyVelocity = Math.round(((currentW - oldest) / (days / 7)) * 10) / 10;
  }

  // Calculate days to goal
  let daysToGoal: number | null = null;
  let predictedDate: string | null = null;
  const rate = Math.abs(weeklyVelocity) > 0.1 ? Math.abs(weeklyVelocity) : 0.5;

  if (Math.abs(diff) > 0.2) {
    const weeksNeeded = Math.ceil(Math.abs(diff) / rate);
    daysToGoal = Math.min(365, weeksNeeded * 7);
    const d = new Date();
    d.setDate(d.getDate() + daysToGoal);
    predictedDate = getLocalDateString(d);
  }

  // Body Measurements Delta
  let waistDelta = 0;
  let chestDelta = 0;
  let hipDelta = 0;
  if (measurements.length >= 2) {
    const latest = measurements[0];
    const prev = measurements[measurements.length - 1];
    if (latest.waist && prev.waist) waistDelta = Math.round((latest.waist - prev.waist) * 10) / 10;
    if (latest.chest && prev.chest) chestDelta = Math.round((latest.chest - prev.chest) * 10) / 10;
    if (latest.hip && prev.hip) hipDelta = Math.round((latest.hip - prev.hip) * 10) / 10;
  }

  // Recovery
  let totalSleep = 0;
  let sleepCount = 0;
  sleepLogs.forEach((l) => {
    const val = Number(l.totalHours) || 0;
    if (val > 0) {
      totalSleep += val;
      sleepCount++;
    }
  });
  const avgSleep = sleepCount > 0 ? totalSleep / sleepCount : 7;
  const recoveryScore = Math.min(100, Math.round((avgSleep / 8) * 100));

  return {
    trajectory: {
      predictedGoalDate: predictedDate,
      daysToGoal,
      weeklyVelocityKg: weeklyVelocity,
      confidencePct: weights.length >= 5 ? 88 : 72,
      plateauRisk: Math.abs(weeklyVelocity) < 0.1 && weights.length >= 7 ? "Elevated" : "Low",
      assessment: `Tracking towards ${targetW}kg at ${weeklyVelocity !== 0 ? `${Math.abs(weeklyVelocity)} kg/week` : "steady maintenance pace"}.`,
      advice: profile.goal === "lose_weight" 
        ? "Maintain a consistent 300–500 kcal daily deficit with 1.6–2.0g protein/kg bodyweight to protect lean mass."
        : "Ensure progressive overload each week with slight caloric surplus for lean hypertrophy.",
    },
    recomposition: {
      status: waistDelta < 0 && Math.abs(weeklyVelocity) < 0.4 ? "Active Recomposition" : profile.goal === "lose_weight" ? "Fat Loss Primed" : "Lean Mass Building",
      waistTrendCm: waistDelta,
      chestTrendCm: chestDelta,
      hipTrendCm: hipDelta,
      muscleRetentionScore: waistDelta <= 0 ? 90 : 78,
      summary: `Waist circumference shows a change of ${waistDelta > 0 ? `+${waistDelta}` : waistDelta} cm over recent measurements, indicating positive body composition shifts.`,
      targetFocusArea: waistDelta > 0 ? "Focus on visceral fat reduction with daily 30m brisk walking" : "Maintain upper body training volume for posture and V-taper",
    },
    recoveryIndex: {
      score: recoveryScore,
      readiness: recoveryScore >= 85 ? "Peak Performance" : recoveryScore >= 70 ? "Optimal Recovery" : "Moderate Fatigue",
      sleepToWorkoutCorrelation: "Consistent sleep duration aligns with sustained workout intensity and controlled hunger cues.",
      actionTip: "Prioritize 7.5+ hours of sleep on heavy training days to accelerate myofibrillar protein synthesis.",
    },
    milestones: [
      {
        title: `Reach ${Math.round((currentW + (targetW - currentW) * 0.5) * 10) / 10} kg (Halfway Point)`,
        target: `${Math.round((currentW + (targetW - currentW) * 0.5) * 10) / 10} kg`,
        current: `${currentW} kg`,
        progressPct: 50,
        projectedDate: predictedDate || "In 4 weeks",
      },
      {
        title: "Waist Reduction Milestone",
        target: "Sub-82 cm",
        current: measurements[0]?.waist ? `${measurements[0].waist} cm` : "Tracking",
        progressPct: 75,
        projectedDate: "In 6 weeks",
      },
      {
        title: `Ultimate Goal: ${targetW} kg`,
        target: `${targetW} kg`,
        current: `${currentW} kg`,
        progressPct: Math.min(95, Math.max(10, Math.round((1 - Math.abs(diff) / Math.max(1, currentW)) * 100))),
        projectedDate: predictedDate || "In 12 weeks",
      },
    ],
    isAIGenerated: false,
  };
}

/** Generate Comprehensive AI Progress Audit with Gemini 1.5/2.0 Flash */
export async function generateAIProgressAudit(): Promise<AIProgressAuditData> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const profile = (await UserProfile.findOne({ clerkId: user.id }).lean()) as IUserProfile | null;
  if (!profile) throw new Error("Profile not found");

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startStr = getLocalDateString(thirtyDaysAgo);

  const [weights, measurements, workouts, sleepLogs] = await Promise.all([
    WeightLog.find({ clerkId: user.id, date: { $gte: startStr } }).sort({ date: 1 }).lean(),
    BodyMeasurement.find({ clerkId: user.id }).sort({ date: -1 }).limit(10).lean(),
    WorkoutLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
    SleepLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
  ]);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return fallbackProgressAudit(
      profile,
      weights as never,
      measurements as never,
      workouts as never,
      sleepLogs as never
    );
  }

  try {
    const prompt = `You are a premier sports biometrician and exercise physiologist AI.
Analyze the user's longitudinal progress data to compute accurate trajectory forecasting, body recomposition assessment, recovery index, and milestone checkpoints.

User Profile:
- Goal: ${profile.goal}
- Current Weight: ${weights.length > 0 ? weights[weights.length - 1].weight : profile.currentWeight} kg
- Target Weight: ${profile.targetWeight} kg
- Height: ${profile.height} cm, Age: ${profile.age}, Gender: ${profile.gender}
- Planned Workouts/Week: ${profile.workoutDaysPerWeek}

Historical Data (Past 30 Days):
- Weight Logs (${weights.length} entries): ${JSON.stringify(weights.map((w) => ({ date: w.date, weight: w.weight })))}
- Body Circumference History (${measurements.length} logs): ${JSON.stringify(measurements.map((m) => ({ date: m.date, waist: m.waist, chest: m.chest, hip: m.hip, arm: m.arm })))}
- Workouts completed: ${workouts.length} total sessions
- Sleep recorded: ${sleepLogs.length} days

Instructions:
1. Trajectory Forecasting: Estimate realistic target goal completion date based on actual weight delta velocity. Detect if a weight plateau is present (plateauRisk: 'Low' | 'Moderate' | 'Elevated').
2. Body Recomposition: Compare waist, hip, and chest changes against weight velocity to determine if user is undergoing muscle gain alongside fat loss ('Active Recomposition' | 'Fat Loss Primed' | 'Lean Mass Building' | 'Steady Maintenance').
3. Recovery Index: Evaluate sleep & training frequency into a 0-100 score and readiness status.
4. 3 Inspiring Milestone Checkpoints with current vs target stats and estimated dates.

Output strictly valid JSON matching this schema:
{
  "trajectory": {
    "predictedGoalDate": "YYYY-MM-DD",
    "daysToGoal": 45,
    "weeklyVelocityKg": -0.6,
    "confidencePct": 89,
    "plateauRisk": "Low",
    "assessment": "...",
    "advice": "..."
  },
  "recomposition": {
    "status": "Active Recomposition",
    "waistTrendCm": -2.5,
    "chestTrendCm": 1.0,
    "hipTrendCm": -1.5,
    "muscleRetentionScore": 92,
    "summary": "...",
    "targetFocusArea": "..."
  },
  "recoveryIndex": {
    "score": 85,
    "readiness": "Peak Performance",
    "sleepToWorkoutCorrelation": "...",
    "actionTip": "..."
  },
  "milestones": [
    {
      "title": "...",
      "target": "...",
      "current": "...",
      "progressPct": 65,
      "projectedDate": "..."
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
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      return fallbackProgressAudit(
        profile,
        weights as never,
        measurements as never,
        workouts as never,
        sleepLogs as never
      );
    }

    const data = await res.json();
    const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

    return {
      trajectory: {
        predictedGoalDate: parsed.trajectory?.predictedGoalDate || null,
        daysToGoal: Number(parsed.trajectory?.daysToGoal) || null,
        weeklyVelocityKg: Number(parsed.trajectory?.weeklyVelocityKg) || 0,
        confidencePct: Number(parsed.trajectory?.confidencePct) || 85,
        plateauRisk: parsed.trajectory?.plateauRisk || "Low",
        assessment: parsed.trajectory?.assessment || "Progress is trending positively toward your target.",
        advice: parsed.trajectory?.advice || "Maintain current training frequency and macro consistency.",
      },
      recomposition: {
        status: parsed.recomposition?.status || "Active Recomposition",
        waistTrendCm: Number(parsed.recomposition?.waistTrendCm) || 0,
        chestTrendCm: Number(parsed.recomposition?.chestTrendCm) || 0,
        hipTrendCm: Number(parsed.recomposition?.hipTrendCm) || 0,
        muscleRetentionScore: Number(parsed.recomposition?.muscleRetentionScore) || 85,
        summary: parsed.recomposition?.summary || "Circumferences are evolving favourably in relation to weight.",
        targetFocusArea: parsed.recomposition?.targetFocusArea || "Core stability and upper body hypertrophy.",
      },
      recoveryIndex: {
        score: Number(parsed.recoveryIndex?.score) || 82,
        readiness: parsed.recoveryIndex?.readiness || "Optimal Recovery",
        sleepToWorkoutCorrelation: parsed.recoveryIndex?.sleepToWorkoutCorrelation || "Consistent rest enables strong progressive overload.",
        actionTip: parsed.recoveryIndex?.actionTip || "Ensure 7.5+ hours of sleep on major workout days.",
      },
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
      isAIGenerated: true,
    };
  } catch (err) {
    console.error("AI Progress Audit error:", err);
    return fallbackProgressAudit(
      profile,
      weights as never,
      measurements as never,
      workouts as never,
      sleepLogs as never
    );
  }
}
