"use server";

import { connectToDatabase } from "@/lib/database";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import WorkoutPlan from "@/lib/database/models/workout-plan.model";
import UserProfile from "@/lib/database/models/user-profile.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  completeWorkoutPlanDaySchema,
  workoutLogSchema,
  workoutPlanSchema,
  type WorkoutLogFormValues,
  type WorkoutPlanFormValues,
} from "@/validations/fitness";
import { getLocalDateString } from "@/lib/utils";
import type { IWorkoutPlanDay, IUserProfile } from "@/types/fitness";

type PlanExerciseInput = {
  exerciseName: string;
  trackingMode?: "reps" | "time";
  sets: number;
  reps: number;
  seconds?: number;
};

function getDayOfWeekFromDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).getDay();
}

function estimateWorkoutDuration(exercises: PlanExerciseInput[]) {
  const totalSets = exercises.reduce((sum, ex) => sum + Number(ex.sets || 0), 0);
  const timeSeconds = exercises.reduce(
    (sum, ex) =>
      sum +
      (ex.trackingMode === "time"
        ? Number(ex.sets || 0) * Number(ex.seconds || 0)
        : 0),
    0,
  );
  return Math.max(5, Math.round(totalSets * 2.5 + exercises.length * 3 + timeSeconds / 60));
}

function fallbackWorkoutCalories(
  exercises: PlanExerciseInput[],
  profile?: Partial<IUserProfile> | null,
) {
  const duration = estimateWorkoutDuration(exercises);
  const bodyWeight = Number(profile?.currentWeight) || 70;
  const names = exercises.map((e) => e.exerciseName.toLowerCase()).join(" ");
  const cardioTerms = ["run", "jog", "cycle", "bike", "cardio", "hiit", "burpee", "jump", "rope"];
  const legTerms = ["squat", "deadlift", "lunge", "leg", "press"];
  const met = cardioTerms.some((term) => names.includes(term))
    ? 8
    : legTerms.some((term) => names.includes(term))
      ? 6
      : 5;
  return Math.max(20, Math.round(((met * 3.5 * bodyWeight) / 200) * duration));
}

async function estimateWorkoutCaloriesWithAI(
  title: string,
  exercises: PlanExerciseInput[],
  profile?: Partial<IUserProfile> | null,
) {
  const fallbackCalories = fallbackWorkoutCalories(exercises, profile);
  const duration = estimateWorkoutDuration(exercises);
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return { durationMinutes: duration, caloriesBurned: fallbackCalories };
  }

  try {
    const prompt = `You are an exercise physiology calorie estimator. Estimate active workout calories for this planned session.

User:
- weightKg: ${Number(profile?.currentWeight) || 70}
- age: ${Number(profile?.age) || 30}
- gender: ${profile?.gender || "other"}
- goal: ${profile?.goal || "maintain"}

Workout:
- title: ${title}
- exercises: ${exercises.map((e) => e.trackingMode === "time" ? `${e.exerciseName}: ${e.sets} sets x ${e.seconds || 0} seconds` : `${e.exerciseName}: ${e.sets} sets x ${e.reps} reps`).join("; ")}
- estimatedDurationMinutes: ${duration}

Return strict JSON only:
{
  "durationMinutes": 45,
  "caloriesBurned": 260
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.15,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!res.ok) {
      return { durationMinutes: duration, caloriesBurned: fallbackCalories };
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = candidateText ? JSON.parse(candidateText) : {};
    return {
      durationMinutes: Math.max(
        10,
        Math.round(Number(parsed.durationMinutes) || duration),
      ),
      caloriesBurned: Math.max(
        20,
        Math.round(Number(parsed.caloriesBurned) || fallbackCalories),
      ),
    };
  } catch (err) {
    console.error("Workout calorie AI estimation error:", err);
    return { durationMinutes: duration, caloriesBurned: fallbackCalories };
  }
}

export async function logWorkout(formData: WorkoutLogFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = workoutLogSchema.parse(formData);
  const profile = (await UserProfile.findOne({ clerkId: user.id }).lean()) as
    | IUserProfile
    | null;
  const estimateInput: PlanExerciseInput[] = validated.exercises.map((exercise) => {
    const isTimeBased = exercise.sets.some(
      (set) => Number(set.durationSeconds || 0) > 0,
    );
    return {
      exerciseName: exercise.exerciseName,
      trackingMode: isTimeBased ? "time" : "reps",
      sets: exercise.sets.length,
      reps:
        Math.round(
          exercise.sets.reduce((sum, set) => sum + Number(set.reps || 0), 0) /
            Math.max(1, exercise.sets.length),
        ) || 1,
      seconds:
        Math.round(
          exercise.sets.reduce(
            (sum, set) => sum + Number(set.durationSeconds || 0),
            0,
          ) / Math.max(1, exercise.sets.length),
        ) || 0,
    };
  });
  const aiEstimate = await estimateWorkoutCaloriesWithAI(
    validated.title,
    estimateInput,
    profile,
  );

  // Calculate total duration & calories if not provided
  const totalDuration =
    validated.durationMinutes ||
    validated.exercises.reduce((sum, e) => sum + (e.durationMinutes || 0), 0) ||
    aiEstimate.durationMinutes;
  const totalCalories =
    validated.caloriesBurned ||
    validated.exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0) ||
    aiEstimate.caloriesBurned;

  const workout = await WorkoutLog.create({
    clerkId: user.id,
    date: validated.date || getLocalDateString(),
    title: validated.title,
    workoutType: validated.workoutType,
    exercises: validated.exercises,
    durationMinutes: totalDuration,
    caloriesBurned: totalCalories,
    notes: validated.notes || "",
  });

  revalidatePath("/");
  revalidatePath("/workout");
  return JSON.parse(JSON.stringify(workout));
}

export async function saveWorkoutPlan(formData: WorkoutPlanFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = workoutPlanSchema.parse(formData);
  const profile = (await UserProfile.findOne({ clerkId: user.id }).lean()) as
    | IUserProfile
    | null;

  const days = await Promise.all(
    validated.days.map(async (day) => {
      const estimate = await estimateWorkoutCaloriesWithAI(
        day.title,
        day.exercises,
        profile,
      );
      const caloriesPerSetTotal = day.exercises.reduce(
        (sum, ex) => sum + Number(ex.sets || 0),
        0,
      );

      return {
        dayOfWeek: day.dayOfWeek,
        title: day.title,
        estimatedDurationMinutes: estimate.durationMinutes,
        estimatedCaloriesBurned: estimate.caloriesBurned,
        exercises: day.exercises.map((ex) => ({
          exerciseName: ex.exerciseName.trim(),
          trackingMode: ex.trackingMode,
          sets: ex.sets,
          reps: ex.reps,
          seconds: ex.seconds,
          caloriesBurned: caloriesPerSetTotal
            ? Math.round((estimate.caloriesBurned * ex.sets) / caloriesPerSetTotal)
            : 0,
        })),
      };
    }),
  );

  const plan = await WorkoutPlan.findOneAndUpdate(
    { clerkId: user.id },
    { clerkId: user.id, days },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  revalidatePath("/");
  revalidatePath("/workout");
  return JSON.parse(JSON.stringify(plan));
}

export async function getWorkoutPlan() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const plan = await WorkoutPlan.findOne({ clerkId: user.id }).lean();
  return JSON.parse(JSON.stringify(plan));
}

export async function getWorkoutPlanForDate(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dayOfWeek = getDayOfWeekFromDate(date);
  const plan = (await WorkoutPlan.findOne(
    { clerkId: user.id, "days.dayOfWeek": dayOfWeek },
    { "days.$": 1 },
  ).lean()) as { days?: IWorkoutPlanDay[] } | null;

  const day = (plan?.days?.[0] || null) as IWorkoutPlanDay | null;
  return JSON.parse(JSON.stringify(day));
}

export async function completeWorkoutPlanDay(
  date: string,
  planDayId: string,
  completedExercises?: Array<{
    exerciseName: string;
    trackingMode: "reps" | "time";
    setsCompleted: number;
    reps: number;
    seconds: number;
  }>,
) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const plan = (await WorkoutPlan.findOne({ clerkId: user.id }).lean()) as {
    days?: IWorkoutPlanDay[];
  } | null;
  const day = ((plan?.days || []) as IWorkoutPlanDay[]).find(
    (item) => String(item._id) === planDayId,
  );
  if (!day) throw new Error("Workout plan day not found");

  const validated = completeWorkoutPlanDaySchema.parse({
    date,
    planDayId,
    completedExercises:
      completedExercises ||
      day.exercises.map((exercise) => ({
        exerciseName: exercise.exerciseName,
        trackingMode: exercise.trackingMode || "reps",
        setsCompleted: exercise.sets,
        reps: exercise.reps,
        seconds: exercise.seconds || 0,
      })),
  });

  const existing = await WorkoutLog.findOne({
    clerkId: user.id,
    date: validated.date,
    sourcePlanDayId: validated.planDayId,
  }).lean();
  if (existing) return JSON.parse(JSON.stringify(existing));

  const completed = validated.completedExercises.filter(
    (exercise) => Number(exercise.setsCompleted || 0) > 0,
  );
  if (completed.length === 0) {
    throw new Error("Select at least one completed set");
  }

  const profile = (await UserProfile.findOne({ clerkId: user.id }).lean()) as
    | IUserProfile
    | null;
  const estimate = await estimateWorkoutCaloriesWithAI(
    day.title,
    completed.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      trackingMode: exercise.trackingMode,
      sets: exercise.setsCompleted,
      reps: exercise.reps,
      seconds: exercise.seconds,
    })),
    profile,
  );
  const totalSets = completed.reduce(
    (sum, ex) => sum + Number(ex.setsCompleted || 0),
    0,
  );

  const workout = await WorkoutLog.create({
    clerkId: user.id,
    date: validated.date,
    title: day.title,
    workoutType: "custom",
    sourcePlanDayId: validated.planDayId,
    durationMinutes: estimate.durationMinutes,
    caloriesBurned: estimate.caloriesBurned,
    notes:
      completed.length === day.exercises.length
        ? "Completed from saved workout plan."
        : "Partially completed from saved workout plan.",
    exercises: completed.map((ex) => ({
      exerciseName: ex.exerciseName,
      sets: Array.from({ length: Number(ex.setsCompleted) || 1 }, (_, index) => ({
        setNumber: index + 1,
        reps: ex.trackingMode === "time" ? 0 : Number(ex.reps) || 1,
        weight: 0,
        durationSeconds: ex.trackingMode === "time" ? Number(ex.seconds) || 0 : 0,
      })),
      durationMinutes: totalSets
        ? Math.round((estimate.durationMinutes * Number(ex.setsCompleted || 0)) / totalSets)
        : 0,
      caloriesBurned: totalSets
        ? Math.round((estimate.caloriesBurned * Number(ex.setsCompleted || 0)) / totalSets)
        : 0,
    })),
  });

  revalidatePath("/");
  revalidatePath("/workout");
  return JSON.parse(JSON.stringify(workout));
}

export async function getWorkoutLogsForDate(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const logs = await WorkoutLog.find({ clerkId: user.id, date }).lean();
  return JSON.parse(JSON.stringify(logs));
}

export async function getWorkoutHistory(days: number = 30) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = getLocalDateString(startDate);

  const logs = await WorkoutLog.find({
    clerkId: user.id,
    date: { $gte: startStr },
  })
    .sort({ date: -1 })
    .lean();

  return JSON.parse(JSON.stringify(logs));
}

export async function getPersonalRecords() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return {};

  const workouts = (await WorkoutLog.find(
    { clerkId: user.id },
    { "exercises.exerciseName": 1, "exercises.sets.weight": 1, "exercises.sets.reps": 1, date: 1 }
  ).lean()) as unknown as {
    date: string;
    exercises: Array<{
      exerciseName: string;
      sets: Array<{ weight: number; reps: number }>;
    }>;
  }[];

  const prMap: Record<string, { weight: number; reps: number; date: string }> = {};

  for (let i = 0; i < workouts.length; i++) {
    const w = workouts[i];
    if (!w.exercises) continue;
    for (let j = 0; j < w.exercises.length; j++) {
      const ex = w.exercises[j];
      if (!ex.exerciseName || !ex.sets) continue;
      const key = ex.exerciseName.toLowerCase().trim();
      for (let k = 0; k < ex.sets.length; k++) {
        const set = ex.sets[k];
        const volume = (set.weight || 0) * (set.reps || 0);
        const currentPr = prMap[key];
        if (!currentPr || volume > (currentPr.weight * currentPr.reps)) {
          prMap[key] = {
            weight: set.weight || 0,
            reps: set.reps || 0,
            date: w.date,
          };
        }
      }
    }
  }

  return prMap;
}

export async function deleteWorkoutLog(logId: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await WorkoutLog.findOneAndDelete({ _id: logId, clerkId: user.id });
  revalidatePath("/");
  revalidatePath("/workout");
}
