"use server";

import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import MealLog from "@/lib/database/models/meal-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { getLocalDateString } from "@/lib/utils";
import type { IUserProfile, IBodyMeasurement, IWeightLog } from "@/types/fitness";
import {
  calculateUnifiedHealthMetrics,
  calcBMR,
  calcTDEE,
} from "@/lib/health-calculations";

export interface AIProfileAssessmentData {
  displayBadge?: string;
  isStale?: boolean;
  assessmentMeta: {
    basedOnWeightKg: number;
    basedOnDate: string;
    basedOnWaistCm?: number;
    basedOnNeckCm?: number;
    basedOnHipCm?: number;
    isStale: boolean;
    displayBadge: string;
  };
  metabolicProfile: {
    bmr: number;
    tdee: number;
    bodyFatEstimatePct: number;
    bodyFatRangeText: string;
    leanMassKg: number;
    fatMassKg: number;
    metabolicAge: number;
    bmi: number;
    bmiCategory: string;
    whr: number;
    whtr: number;
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
      localizedSources: string[];
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
    cardiovascularRiskDisclaimer: string;
    primaryRiskFactors: string[];
    preventiveHabits: string[];
    wellnessGoal: string;
    lifespan: string;
  };
  isAIGenerated: boolean;
}

/** Localized protein options available across Bangladesh */
const BD_LOCAL_PROTEIN_SOURCES = [
  "Eggs (boiled, poach, or dim bhuna — ~6g protein/egg)",
  "Lentils/Dal (musur, mug, chola dal — ~8-9g protein per cooked cup)",
  "Soya Chunks (soybean nuggets — ~50g protein per 100g dry)",
  "Chickpeas/Chola (chola bhuna, boiled chickpea — ~14g protein per cooked cup)",
  "Fresh Fish (rui, katla, tilapia, pangas — ~18-22g protein per 100g)",
  "Chicken (deshi/broiler breast or curry cut — ~25-28g protein per 100g cooked)",
];

/**
 * Deterministic fallback assessment engine using the SINGLE SOURCE OF TRUTH.
 * Shares exact calculations with Overview and Targets tabs.
 */
function buildAssessmentFromUnified(
  unified: ReturnType<typeof calculateUnifiedHealthMetrics>,
  profile: IUserProfile,
  basedOnDate: string,
  isStale: boolean = false,
  isAIGenerated: boolean = false,
): AIProfileAssessmentData {
  const scaledPrePostProtein = Math.max(
    15,
    Math.round(unified.targets.dailyProteinGoal * 0.22),
  );

  const cardioRiskLevel: "Low" | "Moderate" | "Borderline" | "Elevated" =
    unified.whr !== null && unified.whr > 0.95
      ? "Moderate"
      : unified.whtr !== null && unified.whtr > 0.55
        ? "Borderline"
        : "Low";

  const displayBadge = `Based on ${unified.currentWeight} kg, ${basedOnDate}`;
  return {
    displayBadge,
    isStale,
    assessmentMeta: {
      basedOnWeightKg: unified.currentWeight,
      basedOnDate,
      basedOnWaistCm: unified.whr !== null ? unified.whr : undefined,
      isStale,
      displayBadge,
    },
    metabolicProfile: {
      bmr: unified.bmr,
      tdee: unified.tdee,
      bodyFatEstimatePct: unified.bodyFatPct || 20,
      bodyFatRangeText: unified.bodyFatRange?.formattedRange || "±3.5%",
      leanMassKg: unified.leanMass || Math.round(unified.currentWeight * 0.75),
      fatMassKg: unified.fatMass || Math.round(unified.currentWeight * 0.25),
      metabolicAge:
        unified.age + (unified.bmi > 27 ? 2 : unified.bmi < 22 ? -2 : 0),
      bmi: unified.bmi,
      bmiCategory: unified.bmiCategory.label,
      whr: unified.whr || 0.88,
      whtr: unified.whtr || 0.5,
      metabolicSummary: `Your Mifflin-St Jeor BMR of ${unified.bmr} kcal and TDEE of ${unified.tdee} kcal (${unified.activityLabel}) form your baseline energy equation. Your ${unified.leanMass ?? "--"} kg of lean mass burns approximately 13 kcal/kg/day at rest, providing your primary metabolic engine.`,
      metabolicOptimizationTip:
        "Resting skeletal muscle burns approximately 13 kcal/kg/day at rest (compared to ~4.5 kcal/kg for adipose tissue). Resistance training preserves this active tissue and optimizes insulin sensitivity during fat loss.",
    },
    macroStrategy: {
      recommended: {
        calories: unified.targets.dailyCaloriesGoal,
        protein: unified.targets.dailyProteinGoal,
        carbs: unified.targets.dailyCarbGoal,
        fat: unified.targets.dailyFatGoal,
      },
      timing: {
        preworkout: `(Optional) 60–90 min pre-workout: Light meal containing ~${scaledPrePostProtein}g protein (e.g. 2 boiled eggs or small cup of chola) with a banana or ruti. Skip if fasting or training early.`,
        postworkout: `(Optional) Within 60–90 min post-workout: Regular balanced meal providing ~${scaledPrePostProtein}g protein (e.g. 100g fish or chicken with dal and bhaat).`,
        lastMeal:
          "Evening meal 2–3 hours before bed: High-protein, high-fiber plate (fish/chicken/soya chunks with green shak/sabzi and light dal).",
        localizedSources: BD_LOCAL_PROTEIN_SOURCES,
      },
      rationale: `Configured for ${profile.goal?.replace("_", " ")}: ${unified.targets.dailyProteinGoal}g protein (${unified.targets.proteinRatioUsed} g/kg body weight), providing adequate amino acids without digestive burden on local Bangladeshi foods.`,
      weeklyAdjustmentTip:
        "TDEE multipliers are statistical baselines. If weight changes diverge from 0.2–0.7 kg/week over 14+ days, use the suggested adjustment card on your profile.",
    },
    workoutStrategy: {
      recommendedSplit:
        unified.workoutDaysPerWeek >= 5
          ? "Push / Pull / Legs (PPL)"
          : unified.workoutDaysPerWeek >= 4
            ? "Upper / Lower (4 Days)"
            : "Full Body (3 Days/Week)",
      weeklyStructure:
        unified.workoutDaysPerWeek >= 4
          ? [
              "Day 1: Upper Body Strength (Push & Pull)",
              "Day 2: Lower Body & Posterior Chain (Squat/RDL)",
              "Day 3: Rest or Light Walking (Active Recovery)",
              "Day 4: Upper Body Hypertrophy & Arms",
              "Day 5: Lower Body & Core Conditioning",
            ]
          : [
              "Monday: Full Body Strength (Squat, Press, Row)",
              "Wednesday: Full Body Strength (Deadlift, Push-up, Lunge)",
              "Friday: Full Body Conditioning & Core",
            ],
      priorityMovements: [
        "Bodyweight or Barbell Squats — Quad & glute development",
        "Romanian Deadlifts (RDL) or Hip Thrusts — Hamstrings & spine support",
        "Push-up progressions or Dumbbell Bench Press — Chest & shoulder strength",
        "Lat Pulldowns or Inverted Rows — Postural back strength",
        "Overhead Dumbbell Press — Shoulder & scapular stability",
      ],
      cardioRecommendation:
        profile.goal === "lose_weight"
          ? "3–4 sessions/week: 25–30 min brisk walking or Zone 2 aerobic cycling. Spot reduction does not work; aerobic activity enhances overall cardiovascular fat oxidation."
          : "2–3 sessions/week of 20 min easy aerobic cardio for cardiovascular conditioning.",
      phaseLabel:
        profile.goal === "gain_muscle"
          ? "Hypertrophy & Strength Phase"
          : profile.goal === "lose_weight"
            ? "Fat Loss & Muscle Retention Phase"
            : "Maintenance & Athletic Performance Phase",
    },
    longevityRoadmap: {
      cardiovascularRiskLevel: cardioRiskLevel,
      cardiovascularRiskDisclaimer:
        "Screening estimate from waist circumference ratios (not a medical diagnosis).",
      primaryRiskFactors: [
        unified.whr !== null && unified.whr > 0.95
          ? "Screening estimate: Elevated waist-to-hip ratio indicates visceral fat storage. Spot reduction does not work; a sustained deficit with cardio and lifting reduces visceral fat."
          : "Waist-to-hip ratio in healthy cardiovascular screening range",
        unified.bodyFatPct !== null && unified.bodyFatPct > 25
          ? "Body fat percentage above athletic range"
          : "Body fat percentage in healthy functional range",
        "Prolonged sitting — aim for 7,500–10,000 daily steps across Dhaka/urban routines",
      ],
      preventiveHabits: [
        "30+ min brisk walking daily for cardiovascular longevity and insulin sensitivity",
        "Resistance training 3–4× per week to maintain skeletal muscle metabolic sink",
        "7+ hours quality sleep nightly for hormone regulation and cortisol balance",
        "Leafy greens (shak, lau, potol, dherosh) with daily main meals for micronutrients and fiber",
        "Prioritize whole cooked proteins (eggs, dal, fish, chicken, soya) over processed bakery snacks",
      ],
      wellnessGoal:
        "Sustain functional strength, healthy blood sugar control, and optimal body composition for long-term healthspan.",
      lifespan:
        "Consistent muscle-strengthening exercise and cardiorespiratory fitness add 3–7 quality years to functional life expectancy.",
    },
    isAIGenerated,
  };
}

/**
 * Generate or retrieve AI Profile & Metabolic Assessment.
 * Implements strict staleness tracking, single source of truth, and guardrails.
 */
export async function generateAIProfileAssessment(
  forceRefresh: boolean = false,
): Promise<AIProfileAssessmentData> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const profile = (await UserProfile.findOne({
    clerkId: user.id,
  }).lean()) as (IUserProfile & { aiCoachAssessment?: any }) | null;
  if (!profile) throw new Error("Profile not found");

  const [latestMeasurement, latestWeightDoc, firstWeightDoc, recentMeals] =
    await Promise.all([
      BodyMeasurement.findOne({ clerkId: user.id })
        .sort({ date: -1, createdAt: -1 })
        .lean() as Promise<IBodyMeasurement | null>,
      WeightLog.findOne({ clerkId: user.id })
        .sort({ date: -1, createdAt: -1 })
        .lean() as Promise<IWeightLog | null>,
      WeightLog.findOne({ clerkId: user.id })
        .sort({ date: 1, createdAt: 1 })
        .lean() as Promise<IWeightLog | null>,
      MealLog.find({
        clerkId: user.id,
        date: {
          $gte: getLocalDateString(new Date(Date.now() - 7 * 86400000)),
        },
      }).lean(),
    ]);

  const currentWeight = latestWeightDoc?.weight || profile.currentWeight || 70;
  const startWeight = firstWeightDoc?.weight || profile.currentWeight || currentWeight;

  // Single Source of Truth Unified Computation
  const unified = calculateUnifiedHealthMetrics({
    gender: profile.gender,
    age: profile.age,
    heightCm: profile.height,
    currentWeightKg: currentWeight,
    startWeightKg: startWeight,
    targetWeightKg: profile.targetWeight,
    activityLevel: profile.activityLevel,
    goal: profile.goal,
    workoutDaysPerWeek: profile.workoutDaysPerWeek,
    waistCm: latestMeasurement?.waist,
    neckCm: latestMeasurement?.neck,
    hipCm: latestMeasurement?.hip,
    useCustomMacros: profile.useCustomMacros,
    customCalories: profile.dailyCaloriesGoal,
    customProtein: profile.dailyProteinGoal,
    customFat: profile.dailyFatGoal,
    customCarb: profile.dailyCarbGoal,
    customFiber: profile.dailyFiberGoal,
    customWaterMl: profile.waterGoalMl,
  });

  const todayDateFormatted = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Check cached assessment & staleness
  const cached = profile.aiCoachAssessment;
  if (cached?.assessment && !forceRefresh) {
    const cachedInputs = cached.inputs || {};
    const weightSame =
      typeof cachedInputs.weight === "number" &&
      Math.abs(cachedInputs.weight - currentWeight) < 0.2;
    const waistSame =
      (cachedInputs.measurements?.waist || undefined) ===
      (latestMeasurement?.waist || undefined);
    const goalSame = cachedInputs.goal === profile.goal;
    const activitySame = cachedInputs.activityLevel === profile.activityLevel;

    const isStale = !(weightSame && waistSame && goalSame && activitySame);

    // Return cached with updated staleness flag
    const cachedAssessment = cached.assessment as AIProfileAssessmentData;
    const badgeText = `Based on ${cachedInputs.weight || currentWeight} kg, ${cachedInputs.date || todayDateFormatted}`;
    return {
      ...cachedAssessment,
      displayBadge: badgeText,
      isStale,
      assessmentMeta: {
        ...cachedAssessment.assessmentMeta,
        isStale,
        displayBadge: badgeText,
      },
    };
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    const fallback = buildAssessmentFromUnified(
      unified,
      profile,
      todayDateFormatted,
      false,
      false,
    );
    await UserProfile.updateOne(
      { clerkId: user.id },
      {
        $set: {
          aiCoachAssessment: {
            assessment: fallback,
            inputs: {
              weight: currentWeight,
              date: todayDateFormatted,
              measurements: {
                waist: latestMeasurement?.waist,
                neck: latestMeasurement?.neck,
                hip: latestMeasurement?.hip,
              },
              goal: profile.goal,
              activityLevel: profile.activityLevel,
            },
            generatedAt: new Date(),
          },
        },
      },
    );
    return fallback;
  }

  try {
    const prompt = `You are a precision metabolic physician, clinical exercise physiologist, and sports nutritionist localized for Bangladesh.
Create a personalized metabolic profile and practical lifestyle roadmap for this user.

CRITICAL SCIENTIFIC & SAFETY GUARDRAILS (MUST FOLLOW WITHOUT EXCEPTION):
1. PRE-COMPUTED NUMBERS: DO NOT recalculate BMR, TDEE, calories, or macros. Use the exact values provided below.
2. METABOLIC RATE FACT: Skeletal muscle burns approximately 13 kcal/kg/day at rest (never state 50-80 kcal/day).
3. NO SPOT REDUCTION: Core workouts do NOT spot-reduce abdominal or visceral fat. Advise a calorie deficit, aerobic activity, and resistance training.
4. SCREENING DISCLAIMER: Clearly label waist-to-hip / waist-to-height risk flags as screening estimates from anthropometric ratios, NOT clinical medical diagnoses.
5. LOCALIZED FOODS: Tailor all nutrition tips to affordable, local Bangladeshi foods (eggs, musur/mug dal, soya chunks, chola/chickpeas, rui/katla/tilapia fish, chicken).
6. MEAL TIMING: Make pre/post-workout meals OPTIONAL and scaled to ~20-25% of the user's daily protein target (~${Math.round(unified.targets.dailyProteinGoal * 0.22)}g protein).

PRE-CALCULATED USER METRICS (USE EXACTLY AS PROVIDED):
- Name: ${profile.name || "User"}, Gender: ${profile.gender}, Age: ${profile.age}
- Height: ${profile.height} cm, Current Weight: ${currentWeight} kg, Target Weight: ${profile.targetWeight} kg
- BMR: ${unified.bmr} kcal (Mifflin-St Jeor)
- TDEE: ${unified.tdee} kcal (${unified.activityLabel})
- BMI: ${unified.bmi} (${unified.bmiCategory.label})
- Body Fat (US Navy): ${unified.bodyFatPct ?? "N/A"}% (Estimated range: ${unified.bodyFatRange?.formattedRange ?? "N/A"})
- Lean Mass: ${unified.leanMass ?? "N/A"} kg, Fat Mass: ${unified.fatMass ?? "N/A"} kg
- Waist-to-Hip Ratio: ${unified.whr ?? "N/A"}, Waist-to-Height Ratio: ${unified.whtr ?? "N/A"}
- Daily Calorie Target: ${unified.targets.dailyCaloriesGoal} kcal (${profile.goal.replace("_", " ")})
- Daily Protein Target: ${unified.targets.dailyProteinGoal}g (${unified.targets.proteinRatioUsed} g/kg body weight)
- Daily Carbs Target: ${unified.targets.dailyCarbGoal}g, Fat: ${unified.targets.dailyFatGoal}g, Water: ${unified.targets.waterGoalMl}ml
- Workout Frequency: ${profile.workoutDaysPerWeek} days/week

Recent meals in past 7 days: ${recentMeals.length} logged.

Output strictly valid JSON matching this schema:
{
  "metabolicSummary": "Concise 2-3 sentence overview of their metabolic engine...",
  "metabolicOptimizationTip": "Scientific advice mentioning ~13 kcal/kg/day for muscle at rest...",
  "macroTiming": {
    "preworkout": "Optional light meal tip with ~${Math.round(unified.targets.dailyProteinGoal * 0.22)}g protein using local foods...",
    "postworkout": "Optional post-workout meal with ~${Math.round(unified.targets.dailyProteinGoal * 0.22)}g protein...",
    "lastMeal": "Dinner/bedtime meal tip using local foods..."
  },
  "macroRationale": "Explanation of protein & calorie targets...",
  "weeklyAdjustmentTip": "Tip mentioning 0.2-0.7 kg/week sustainable rate...",
  "workoutSplit": "Recommended split name...",
  "weeklyStructure": ["Day 1: ...", "Day 2: ...", "Day 3: ...", "Day 4: ..."],
  "priorityMovements": ["Movement 1 — ...", "Movement 2 — ...", "Movement 3 — ..."],
  "cardioRecommendation": "Aerobic advice noting spot reduction is impossible...",
  "phaseLabel": "${unified.goal === "gain_muscle" ? "Hypertrophy Phase" : "Fat Loss Phase"}",
  "cardiovascularRiskLevel": "${unified.whr !== null && unified.whr > 0.95 ? "Moderate" : "Low"}",
  "cardiovascularRiskDisclaimer": "Screening estimate from waist ratio, not a medical diagnosis.",
  "primaryRiskFactors": ["...", "..."],
  "preventiveHabits": ["...", "..."],
  "wellnessGoal": "Long term transformation objective...",
  "lifespan": "Healthspan research insight..."
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
      },
    );

    let parsed: any = {};
    if (res.ok) {
      const data = await res.json();
      parsed = JSON.parse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}",
      );
    } else {
      // Fallback model
      const fallbackRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
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
        },
      );
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        parsed = JSON.parse(
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}",
        );
      }
    }

    const badgeText = `Based on ${currentWeight} kg, ${todayDateFormatted}`;
    const assessmentResult: AIProfileAssessmentData = {
      displayBadge: badgeText,
      isStale: false,
      assessmentMeta: {
        basedOnWeightKg: currentWeight,
        basedOnDate: todayDateFormatted,
        basedOnWaistCm: latestMeasurement?.waist,
        basedOnNeckCm: latestMeasurement?.neck,
        basedOnHipCm: latestMeasurement?.hip,
        isStale: false,
        displayBadge: badgeText,
      },
      metabolicProfile: {
        bmr: unified.bmr,
        tdee: unified.tdee,
        bodyFatEstimatePct: unified.bodyFatPct || 20,
        bodyFatRangeText: unified.bodyFatRange?.formattedRange || "±3.5%",
        leanMassKg:
          unified.leanMass || Math.round(unified.currentWeight * 0.75),
        fatMassKg: unified.fatMass || Math.round(unified.currentWeight * 0.25),
        metabolicAge:
          unified.age + (unified.bmi > 27 ? 2 : unified.bmi < 22 ? -2 : 0),
        bmi: unified.bmi,
        bmiCategory: unified.bmiCategory.label,
        whr: unified.whr || 0.88,
        whtr: unified.whtr || 0.5,
        metabolicSummary:
          parsed.metabolicSummary ||
          `Your Mifflin-St Jeor BMR of ${unified.bmr} kcal and TDEE of ${unified.tdee} kcal (${unified.activityLabel}) form your baseline energy equation. Your ${unified.leanMass ?? "--"} kg of lean mass burns approximately 13 kcal/kg/day at rest.`,
        metabolicOptimizationTip:
          parsed.metabolicOptimizationTip ||
          "Resting skeletal muscle burns approximately 13 kcal/kg/day at rest. Progressive resistance training builds metabolic resilience and preserves functional strength during fat loss.",
      },
      macroStrategy: {
        recommended: {
          calories: unified.targets.dailyCaloriesGoal,
          protein: unified.targets.dailyProteinGoal,
          carbs: unified.targets.dailyCarbGoal,
          fat: unified.targets.dailyFatGoal,
        },
        timing: {
          preworkout:
            parsed.macroTiming?.preworkout ||
            `(Optional) 60-90 min pre-workout: ~${Math.round(unified.targets.dailyProteinGoal * 0.22)}g protein with light carbs (e.g. 2 boiled eggs and banana).`,
          postworkout:
            parsed.macroTiming?.postworkout ||
            `(Optional) Post-workout: ~${Math.round(unified.targets.dailyProteinGoal * 0.22)}g protein (e.g. 100g fish or chicken with dal and bhaat).`,
          lastMeal:
            parsed.macroTiming?.lastMeal ||
            "Dinner 2–3 hours before bed: High-protein sabzi/curry (fish, chicken, or soya chunks with greens).",
          localizedSources: BD_LOCAL_PROTEIN_SOURCES,
        },
        rationale:
          parsed.macroRationale ||
          `Configured for ${profile.goal.replace("_", " ")}: ${unified.targets.dailyProteinGoal}g protein (${unified.targets.proteinRatioUsed} g/kg), providing optimal muscle preservation without digestive strain.`,
        weeklyAdjustmentTip:
          parsed.weeklyAdjustmentTip ||
          "Track weight 2–3 times weekly. If loss pace is under 0.2 kg/week over 14 days, check for unlogged oils or adjust intake by ~150 kcal.",
      },
      workoutStrategy: {
        recommendedSplit:
          parsed.workoutSplit ||
          (unified.workoutDaysPerWeek >= 4 ? "Upper / Lower (4 Days)" : "Full Body (3 Days)"),
        weeklyStructure: Array.isArray(parsed.weeklyStructure) && parsed.weeklyStructure.length > 0
          ? parsed.weeklyStructure
          : [
              "Day 1: Upper Body Strength",
              "Day 2: Lower Body & Core",
              "Day 3: Active Rest / Brisk Walk",
              "Day 4: Full Body Hypertrophy",
            ],
        priorityMovements: Array.isArray(parsed.priorityMovements) && parsed.priorityMovements.length > 0
          ? parsed.priorityMovements
          : [
              "Bodyweight/Barbell Squats — Quad & glute strength",
              "Romanian Deadlifts (RDL) — Posterior chain",
              "Push-ups or Bench Press — Upper body push",
              "Rows or Lat Pulldowns — Postural pull",
            ],
        cardioRecommendation:
          parsed.cardioRecommendation ||
          "3–4 sessions/week: 25–30 min brisk walking. Spot reduction does not work; aerobic exercise improves cardiovascular fat clearance.",
        phaseLabel:
          parsed.phaseLabel ||
          (profile.goal === "gain_muscle" ? "Hypertrophy Phase" : "Fat Loss Phase"),
      },
      longevityRoadmap: {
        cardiovascularRiskLevel:
          parsed.cardiovascularRiskLevel ||
          (unified.whr && unified.whr > 0.95 ? "Moderate" : "Low"),
        cardiovascularRiskDisclaimer:
          "Screening estimate from waist circumference ratios (not a medical diagnosis).",
        primaryRiskFactors: Array.isArray(parsed.primaryRiskFactors) && parsed.primaryRiskFactors.length > 0
          ? parsed.primaryRiskFactors
          : [
              unified.whr && unified.whr > 0.95
                ? "Screening estimate: Elevated waist-to-hip ratio indicates visceral fat accumulation risk. Spot reduction is impossible; focus on whole-body deficit and conditioning."
                : "Waist-to-hip ratio in healthy screening range",
              "Urban sedentary time — target 8,000 daily steps",
            ],
        preventiveHabits: Array.isArray(parsed.preventiveHabits) && parsed.preventiveHabits.length > 0
          ? parsed.preventiveHabits
          : [
              "30+ min daily brisk walking for cardiovascular conditioning",
              "Resistance training 3–4× per week to maintain metabolic tissue",
              "Whole local foods (eggs, dal, fish, chicken, greens) instead of processed snacks",
            ],
        wellnessGoal:
          parsed.wellnessGoal ||
          "Sustain healthy body composition and metabolic healthspan.",
        lifespan:
          parsed.lifespan ||
          "Consistent resistance and aerobic training add 3–7 years of healthy life expectancy.",
      },
      isAIGenerated: true,
    };

    // Save to user profile for staleness tracking
    await UserProfile.updateOne(
      { clerkId: user.id },
      {
        $set: {
          aiCoachAssessment: {
            assessment: assessmentResult,
            inputs: {
              weight: currentWeight,
              date: todayDateFormatted,
              measurements: {
                waist: latestMeasurement?.waist,
                neck: latestMeasurement?.neck,
                hip: latestMeasurement?.hip,
              },
              goal: profile.goal,
              activityLevel: profile.activityLevel,
            },
            generatedAt: new Date(),
          },
        },
      },
    );

    return assessmentResult;
  } catch (err) {
    console.error("AI Profile Assessment error:", err);
    return buildAssessmentFromUnified(
      unified,
      profile,
      todayDateFormatted,
      false,
      false,
    );
  }
}
