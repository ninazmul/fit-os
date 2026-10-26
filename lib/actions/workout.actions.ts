"use server";

import { connectToDatabase } from "@/lib/database";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import WorkoutPlan from "@/lib/database/models/workout-plan.model";
import PersonalRecord from "@/lib/database/models/personal-record.model";
import UserProfile from "@/lib/database/models/user-profile.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  completeWorkoutPlanDaySchema,
  personalRecordSchema,
  workoutLogSchema,
  workoutPlanSchema,
  type PersonalRecordFormValues,
  type WorkoutLogFormValues,
  type WorkoutPlanFormValues,
} from "@/validations/fitness";
import { getLocalDateString } from "@/lib/utils";
import type {
  IPersonalRecord,
  IPersonalRecordSummary,
  IWorkoutPlanDay,
  IUserProfile,
} from "@/types/fitness";

type PlanExerciseInput = {
  exerciseName: string;
  trackingMode?: "reps" | "time";
  sets: number;
  reps: number;
  seconds?: number;
  weight?: number; // working load per set, in kg
};

function getDayOfWeekFromDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).getDay();
}

/** Preferred Gemini models, newest first (older names are deprecated). */
const WORKOUT_CALORIE_MODELS = ["gemini-3.8-flash", "gemini-flash-latest"] as const;

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

/** Total external work performed: kg lifted across every rep. */
function totalVolumeLoad(exercises: PlanExerciseInput[]) {
  return exercises.reduce(
    (sum, ex) =>
      sum +
      (ex.trackingMode === "time"
        ? 0
        : Number(ex.sets || 0) * Number(ex.reps || 0) * Number(ex.weight || 0)),
    0,
  );
}

/**
 * Deterministic MET-based estimate used when the AI is unavailable.
 * Duration and body weight drive the bulk of the cost; resistance-training
 * volume load adds a small progressive-overload premium so heavier sessions
 * score a little higher than light ones.
 */
function fallbackWorkoutCalories(
  exercises: PlanExerciseInput[],
  profile?: Partial<IUserProfile> | null,
) {
  const duration = estimateWorkoutDuration(exercises);
  const bodyWeight = Number(profile?.currentWeight) || 70;
  const names = exercises.map((e) => e.exerciseName.toLowerCase()).join(" ");
  const cardioTerms = ["run", "jog", "cycle", "bike", "cardio", "hiit", "burpee", "jump", "rope"];
  const legTerms = ["squat", "deadlift", "lunge", "leg", "press"];
  const isCardio = cardioTerms.some((term) => names.includes(term));
  const baseMet = isCardio
    ? 8
    : legTerms.some((term) => names.includes(term))
      ? 6
      : 5;
  // ~10,000 kg of volume load ≈ +1 MET, capped so a single outlier can't dominate.
  const loadPremium = isCardio
    ? 0
    : Math.min(1.5, totalVolumeLoad(exercises) / 10000);
  const met = baseMet + loadPremium;
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

  const exerciseLines = exercises
    .map((e) =>
      e.trackingMode === "time"
        ? `${e.exerciseName}: ${e.sets} sets x ${e.seconds || 0} seconds`
        : `${e.exerciseName}: ${e.sets} sets x ${e.reps} reps${
            Number(e.weight) > 0 ? ` @ ${Number(e.weight)}kg` : ""
          }`,
    )
    .join("; ");

  try {
    const prompt = `You are an exercise physiology calorie estimator. Estimate active workout calories for this planned session.

User:
- weightKg: ${Number(profile?.currentWeight) || 70}
- age: ${Number(profile?.age) || 30}
- gender: ${profile?.gender || "other"}
- goal: ${profile?.goal || "maintain"}

Workout:
- title: ${title}
- exercises: ${exerciseLines}
- estimatedDurationMinutes: ${duration}
- totalVolumeLoadKg: ${totalVolumeLoad(exercises)}

Rules:
- Resistance-training energy cost scales mostly with session duration and body weight; a higher load volume raises intensity only modestly. Do NOT inflate the estimate from load alone.
- Count only the active workout window (exclude rest-of-day metabolism).
- Keep estimates realistic (e.g. a ~45-minute moderate strength session for a 70kg adult is roughly 200-350 kcal).

Return strict JSON only:
{
  "durationMinutes": 45,
  "caloriesBurned": 260
}`;

    let res: Response | null = null;
    for (const model of WORKOUT_CALORIE_MODELS) {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
      if (res.ok) break;
    }

    if (!res || !res.ok) {
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
      weight: Math.round(
        exercise.sets.reduce((sum, set) => sum + Number(set.weight || 0), 0) /
          Math.max(1, exercise.sets.length),
      ),
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
          weight: ex.weight,
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
    weight?: number;
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
        weight: exercise.weight || 0,
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
      weight: exercise.weight || 0,
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
        weight: ex.trackingMode === "time" ? 0 : Number(ex.weight) || 0,
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

export async function getPersonalRecords(): Promise<
  Record<string, IPersonalRecordSummary>
> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return {};

  const [workouts, manual] = await Promise.all([
    WorkoutLog.find(
      { clerkId: user.id },
      {
        "exercises.exerciseName": 1,
        "exercises.sets.weight": 1,
        "exercises.sets.reps": 1,
        date: 1,
      },
    ).lean(),
    PersonalRecord.find({ clerkId: user.id }).lean(),
  ]);

  const prMap: Record<string, IPersonalRecordSummary> = {};

  // A PR needs an actual load (weight × reps); bodyweight/time sets are skipped.
  const consider = (
    rawName: string,
    weight: number,
    reps: number,
    date: string,
    source: "log" | "manual",
    id?: string,
  ) => {
    if (!rawName || weight <= 0 || reps <= 0) return;
    const key = rawName.toLowerCase().trim();
    const volume = weight * reps;
    const current = prMap[key];
    const isBetter =
      !current ||
      volume > current.weight * current.reps ||
      (volume === current.weight * current.reps && date > current.date);
    if (isBetter) {
      prMap[key] = { weight, reps, date, source, _id: id };
    }
  };

  for (const w of workouts as unknown as {
    date: string;
    exercises: Array<{
      exerciseName: string;
      sets: Array<{ weight: number; reps: number }>;
    }>;
  }[]) {
    for (const ex of w.exercises || []) {
      for (const set of ex.sets || []) {
        consider(
          ex.exerciseName,
          Number(set.weight) || 0,
          Number(set.reps) || 0,
          w.date,
          "log",
        );
      }
    }
  }

  for (const record of manual as unknown as IPersonalRecord[]) {
    consider(
      record.exerciseName,
      Number(record.weight) || 0,
      Number(record.reps) || 0,
      record.date,
      "manual",
      String(record._id),
    );
  }

  return prMap;
}

/** Manually add a personal record (independent of logged workouts). */
export async function addPersonalRecord(formData: PersonalRecordFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = personalRecordSchema.parse(formData);
  const record = await PersonalRecord.create({
    clerkId: user.id,
    exerciseName: validated.exerciseName.trim(),
    weight: validated.weight,
    reps: validated.reps,
    date: validated.date || getLocalDateString(),
    notes: validated.notes || "",
  });

  revalidatePath("/");
  revalidatePath("/workout");
  return JSON.parse(JSON.stringify(record));
}

export async function deletePersonalRecord(id: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await PersonalRecord.findOneAndDelete({ _id: id, clerkId: user.id });
  revalidatePath("/");
  revalidatePath("/workout");
}

export async function deleteWorkoutLog(logId: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await WorkoutLog.findOneAndDelete({ _id: logId, clerkId: user.id });
  revalidatePath("/");
  revalidatePath("/workout");
}
