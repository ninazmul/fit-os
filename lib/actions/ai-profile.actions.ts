"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import MealLog from "@/lib/database/models/meal-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { getLocalDateString } from "@/lib/utils";
import type { IUserProfile } from "@/types/fitness";

export interface AIProfileAssessmentData {
  metabolicProfile: {
    bmr: number;
    tdee: number;
    bodyFatEstimatePct: number;
    leanMassKg: number;
    metabolicAge: number;
    bmi: number;
    bmiCategory: string;
    whr: number; // waist-to-hip ratio
    whtr: number; // waist-to-height ratio
    metabolicSummary: string;
    metabolicOptimizationTip: string;
  };
  macroStrategy: {
    recommended: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    timing: {
      preworkout: string;
      postworkout: string;
      lastMeal: string;
    };
    rationale: string;
    weeklyAdjustmentTip: string;
  };
  workoutStrategy: {
    recommendedSplit: string;
    weeklyStructure: string[];
    priorityMovements: string[];
    cardioRecommendation: string;
    phaseLabel: string;
  };
  longevityRoadmap: {
    cardiovascularRiskLevel: "Low" | "Moderate" | "Borderline" | "Elevated";
    primaryRiskFactors: string[];
    preventiveHabits: string[];
    wellnessGoal: string;
    lifespan: string;
  };
  isAIGenerated: boolean;
}

/** Deterministic fallback metabolic engine */
function calcBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === "female") {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
}

function fallbackProfileAssessment(
  profile: IUserProfile,
  latestMeasurement: { waist?: number; chest?: number; hip?: number; neck?: number } | null,
  weights: Array<{ weight: number }>
): AIProfileAssessmentData {
  const weight = (weights.length > 0 ? weights[weights.length - 1].weight : null) || profile.currentWeight || 75;
  const height = profile.height || 175;
  const age = profile.age || 30;
  const gender = profile.gender || "male";

  const bmr = calcBMR(weight, height, age, gender);
  const activityMap: Record<string, number> = { sedentary: 1.2, lightly_active: 1.375, moderately_active: 1.55, very_active: 1.725, extra_active: 1.9 };
  const activityMultiplier = activityMap[profile.activityLevel || "moderately_active"] ?? 1.55;
  const tdee = Math.round(bmr * activityMultiplier);

  // Estimate body fat (US Navy method if available)
  let bodyFatPct = gender === "male" ? 18 : 28;
  if (latestMeasurement?.waist && latestMeasurement?.neck) {
    const waist = latestMeasurement.waist;
    const neck = latestMeasurement.neck;
    const hip = latestMeasurement.hip;
    if (gender === "male") {
      bodyFatPct = Math.round(495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450);
    } else if (hip) {
      bodyFatPct = Math.round(495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450);
    }
  }
  bodyFatPct = Math.max(5, Math.min(50, bodyFatPct));

  const leanMassKg = Math.round((weight * (1 - bodyFatPct / 100)) * 10) / 10;
  const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10;
  let bmiCategory = "Normal Weight";
  if (bmi < 18.5) bmiCategory = "Underweight";
  else if (bmi >= 25 && bmi < 30) bmiCategory = "Overweight";
  else if (bmi >= 30) bmiCategory = "Obese";

  const whr = latestMeasurement?.waist && latestMeasurement?.hip
    ? Math.round((latestMeasurement.waist / latestMeasurement.hip) * 100) / 100
    : (gender === "male" ? 0.90 : 0.82);
  const whtr = latestMeasurement?.waist
    ? Math.round((latestMeasurement.waist / height) * 100) / 100
    : 0.50;

  const cardioRisk = whr > (gender === "male" ? 0.95 : 0.85) || whtr > 0.55 ? "Moderate" : "Low";

  const goalCalories = profile.goal === "lose_weight" ? tdee - 400 : profile.goal === "gain_muscle" ? tdee + 250 : tdee;
  const proteinPerKg = profile.goal === "gain_muscle" ? 2.0 : profile.goal === "lose_weight" ? 1.8 : 1.6;
  const protein = Math.round(leanMassKg * proteinPerKg);
  const fat = Math.round((goalCalories * 0.27) / 9);
  const carbs = Math.round((goalCalories - protein * 4 - fat * 9) / 4);

  return {
    metabolicProfile: {
      bmr,
      tdee,
      bodyFatEstimatePct: bodyFatPct,
      leanMassKg,
      metabolicAge: age + (bmi > 27 ? 3 : bmi < 22 ? -2 : 0),
      bmi,
      bmiCategory,
      whr,
      whtr,
      metabolicSummary: `Your BMR of ${bmr} kcal and TDEE of ${tdee} kcal reflects your current metabolic engine. Lean mass of ${leanMassKg}kg is your most valuable metabolic asset.`,
      metabolicOptimizationTip: "Increase lean mass through progressive resistance training to boost your resting metabolic rate by 50–80 kcal/day per kg of muscle added.",
    },
    macroStrategy: {
      recommended: { calories: goalCalories, protein, carbs, fat },
      timing: {
        preworkout: "30g carbs + 20g protein 60–90 min before training (oats, banana, Greek yogurt or whey).",
        postworkout: "40g protein + 60g fast carbs within 60 min post-workout (rice + chicken, or protein shake + fruit).",
        lastMeal: "High protein, low carb meal 2-3 hours before sleep (eggs, cottage cheese, or lentil soup).",
      },
      rationale: `Optimized for ${profile.goal?.replace("_", " ")}: ${protein}g protein (${Math.round(protein * 4 / goalCalories * 100)}%), ${carbs}g carbs (${Math.round(carbs * 4 / goalCalories * 100)}%), ${fat}g fat (${Math.round(fat * 9 / goalCalories * 100)}%).`,
      weeklyAdjustmentTip: "Cycle carbohydrates: higher on training days, moderate on rest days to maximize fuel utilization and metabolic flexibility.",
    },
    workoutStrategy: {
      recommendedSplit: profile.workoutDaysPerWeek && profile.workoutDaysPerWeek >= 5 ? "Push / Pull / Legs (PPL)" : profile.workoutDaysPerWeek && profile.workoutDaysPerWeek >= 4 ? "Upper / Lower (UL)" : "Full Body 3×/Week",
      weeklyStructure: profile.workoutDaysPerWeek && profile.workoutDaysPerWeek >= 4
        ? ["Monday: Upper Body Strength", "Tuesday: Lower Body Hypertrophy", "Thursday: Upper Body Volume", "Friday: Lower Body + Core"]
        : ["Monday: Full Body Strength A", "Wednesday: Full Body Strength B", "Friday: Full Body Metabolic Conditioning"],
      priorityMovements: [
        "Barbell Squat — Primary lower body & hormonal driver",
        "Deadlift — Posterior chain & grip strength",
        "Bench Press / Push-up Progression",
        "Pull-ups / Lat Pulldown — Back width & posture",
        "Overhead Press — Shoulder & core stability",
      ],
      cardioRecommendation: profile.goal === "lose_weight"
        ? "3–4x per week: 30min moderate-intensity cardio (Zone 2 HR 120–145 bpm) or HIIT 20min post-strength on non-training days."
        : "2x per week light cardio for cardiovascular health and metabolic conditioning (20–30min brisk walk or cycling).",
      phaseLabel: profile.goal === "gain_muscle" ? "Hypertrophy / Strength Phase" : profile.goal === "lose_weight" ? "Fat Loss / Recomp Phase" : "Maintenance / Performance Phase",
    },
    longevityRoadmap: {
      cardiovascularRiskLevel: cardioRisk,
      primaryRiskFactors: [
        whr > (gender === "male" ? 0.95 : 0.85) ? "Elevated WHR — visceral fat accumulation risk" : "WHR within healthy range",
        bodyFatPct > (gender === "male" ? 25 : 32) ? "Body fat % above optimal health threshold" : "Body composition within athletic range",
        "Sedentary time — aim for 8,000–10,000 daily steps",
      ],
      preventiveHabits: [
        "30+ min brisk walking daily for cardiovascular longevity",
        "Strength training 3–4× per week (builds metabolic resilience)",
        "7.5+ hours sleep nightly for hormonal regulation",
        "Vegetables with every main meal (fiber, antioxidants, micronutrients)",
        "Limit ultra-processed food to ≤10% of total calories",
      ],
      wellnessGoal: "Achieve athletic body composition (15–18% body fat for men, 22–26% for women) for optimal hormonal health and longevity.",
      lifespan: "Consistent strength training and cardiovascular fitness have been shown to add 3–7 quality years to life expectancy.",
    },
    isAIGenerated: false,
  };
}

/** Generate AI Profile & Metabolic Assessment with Gemini */
export async function generateAIProfileAssessment(): Promise<AIProfileAssessmentData> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const profile = (await UserProfile.findOne({ clerkId: user.id }).lean()) as IUserProfile | null;
  if (!profile) throw new Error("Profile not found");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const startStr = getLocalDateString(sevenDaysAgo);

  const [latestMeasurement, weights, recentMeals] = await Promise.all([
    BodyMeasurement.findOne({ clerkId: user.id }).sort({ date: -1 }).lean(),
    WeightLog.find({ clerkId: user.id }).sort({ date: -1 }).limit(10).lean(),
    MealLog.find({ clerkId: user.id, date: { $gte: startStr } }).lean(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meas = latestMeasurement as any;
  const measSummary = meas
    ? JSON.stringify({ waist: meas.waist, chest: meas.chest, hip: meas.hip, neck: meas.neck, arm: meas.arm })
    : "Not recorded yet";

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return fallbackProfileAssessment(
      profile,
      latestMeasurement as never,
      weights as never
    );
  }

  try {
    const prompt = `You are a metabolic physician, exercise physiologist, and precision nutrition scientist.
Create a comprehensive metabolic profile assessment and health optimization roadmap for this user.

User Biometrics:
- Name: ${profile.name || "User"}, Gender: ${profile.gender}, Age: ${profile.age}
- Height: ${profile.height} cm, Current Weight: ${profile.currentWeight} kg, Target: ${profile.targetWeight} kg
- Activity Level: ${profile.activityLevel}, Goal: ${profile.goal}
- Current Daily Targets: ${profile.dailyCaloriesGoal} kcal, ${profile.dailyProteinGoal}g protein, ${profile.waterGoalMl}ml water
- Workout Frequency Target: ${profile.workoutDaysPerWeek} days/week

Latest Body Circumference Measurements:
${measSummary}

Recent Weight History: ${weights.length} entries, latest: ${weights.length > 0 ? weights[0].weight : profile.currentWeight} kg

Recent Meal Pattern: ${recentMeals.length} meals logged in past 7 days, avg ${recentMeals.length > 0 ? Math.round(recentMeals.reduce((s, m) => s + (Number(m.totalProtein) || 0), 0) / Math.max(1, recentMeals.length)) : 0}g protein, ${recentMeals.length > 0 ? Math.round(recentMeals.reduce((s, m) => s + (Number(m.totalCalories) || 0), 0) / Math.max(1, recentMeals.length)) : 0} kcal per meal.

Output strictly valid JSON matching this schema:
{
  "metabolicProfile": {
    "bmr": 1740,
    "tdee": 2700,
    "bodyFatEstimatePct": 17,
    "leanMassKg": 62.0,
    "metabolicAge": 28,
    "bmi": 23.4,
    "bmiCategory": "Normal Weight",
    "whr": 0.88,
    "whtr": 0.47,
    "metabolicSummary": "...",
    "metabolicOptimizationTip": "..."
  },
  "macroStrategy": {
    "recommended": {
      "calories": 2400,
      "protein": 180,
      "carbs": 220,
      "fat": 72
    },
    "timing": {
      "preworkout": "...",
      "postworkout": "...",
      "lastMeal": "..."
    },
    "rationale": "...",
    "weeklyAdjustmentTip": "..."
  },
  "workoutStrategy": {
    "recommendedSplit": "Upper / Lower",
    "weeklyStructure": ["Monday: ...", "..."],
    "priorityMovements": ["...", "...", "..."],
    "cardioRecommendation": "...",
    "phaseLabel": "Hypertrophy Phase"
  },
  "longevityRoadmap": {
    "cardiovascularRiskLevel": "Low",
    "primaryRiskFactors": ["...", "..."],
    "preventiveHabits": ["...", "..."],
    "wellnessGoal": "...",
    "lifespan": "..."
  }
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
      return fallbackProfileAssessment(profile, latestMeasurement as never, weights as never);
    }

    const data = await res.json();
    const parsed = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

    return {
      metabolicProfile: {
        bmr: Number(parsed.metabolicProfile?.bmr) || 1700,
        tdee: Number(parsed.metabolicProfile?.tdee) || 2500,
        bodyFatEstimatePct: Number(parsed.metabolicProfile?.bodyFatEstimatePct) || 18,
        leanMassKg: Number(parsed.metabolicProfile?.leanMassKg) || 60,
        metabolicAge: Number(parsed.metabolicProfile?.metabolicAge) || (profile.age || 28),
        bmi: Number(parsed.metabolicProfile?.bmi) || 23,
        bmiCategory: parsed.metabolicProfile?.bmiCategory || "Normal Weight",
        whr: Number(parsed.metabolicProfile?.whr) || 0.88,
        whtr: Number(parsed.metabolicProfile?.whtr) || 0.48,
        metabolicSummary: parsed.metabolicProfile?.metabolicSummary || "Your metabolic profile is progressing well.",
        metabolicOptimizationTip: parsed.metabolicProfile?.metabolicOptimizationTip || "Increase lean mass to elevate resting metabolism.",
      },
      macroStrategy: {
        recommended: {
          calories: Number(parsed.macroStrategy?.recommended?.calories) || profile.dailyCaloriesGoal || 2200,
          protein: Number(parsed.macroStrategy?.recommended?.protein) || profile.dailyProteinGoal || 150,
          carbs: Number(parsed.macroStrategy?.recommended?.carbs) || 200,
          fat: Number(parsed.macroStrategy?.recommended?.fat) || 65,
        },
        timing: {
          preworkout: parsed.macroStrategy?.timing?.preworkout || "Complex carbs + protein 60-90 min pre-workout.",
          postworkout: parsed.macroStrategy?.timing?.postworkout || "Fast protein + carbs within 60 min post-workout.",
          lastMeal: parsed.macroStrategy?.timing?.lastMeal || "High protein, low carb 2-3h before sleep.",
        },
        rationale: parsed.macroStrategy?.rationale || "Macro distribution optimized for your goal.",
        weeklyAdjustmentTip: parsed.macroStrategy?.weeklyAdjustmentTip || "Carb cycle based on training volume.",
      },
      workoutStrategy: {
        recommendedSplit: parsed.workoutStrategy?.recommendedSplit || "Upper / Lower",
        weeklyStructure: Array.isArray(parsed.workoutStrategy?.weeklyStructure) ? parsed.workoutStrategy.weeklyStructure : [],
        priorityMovements: Array.isArray(parsed.workoutStrategy?.priorityMovements) ? parsed.workoutStrategy.priorityMovements : [],
        cardioRecommendation: parsed.workoutStrategy?.cardioRecommendation || "2-3x per week Zone 2 cardio.",
        phaseLabel: parsed.workoutStrategy?.phaseLabel || "Training Phase",
      },
      longevityRoadmap: {
        cardiovascularRiskLevel: parsed.longevityRoadmap?.cardiovascularRiskLevel || "Low",
        primaryRiskFactors: Array.isArray(parsed.longevityRoadmap?.primaryRiskFactors) ? parsed.longevityRoadmap.primaryRiskFactors : [],
        preventiveHabits: Array.isArray(parsed.longevityRoadmap?.preventiveHabits) ? parsed.longevityRoadmap.preventiveHabits : [],
        wellnessGoal: parsed.longevityRoadmap?.wellnessGoal || "Achieve and maintain optimal body composition.",
        lifespan: parsed.longevityRoadmap?.lifespan || "Consistent training significantly improves healthspan.",
      },
      isAIGenerated: true,
    };
  } catch (err) {
    console.error("AI Profile Assessment error:", err);
    return fallbackProfileAssessment(profile, latestMeasurement as never, weights as never);
  }
}
