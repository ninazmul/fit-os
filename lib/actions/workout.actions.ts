"use server";

import { connectToDatabase } from "@/lib/database";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { workoutLogSchema, type WorkoutLogFormValues } from "@/validations/fitness";
import { getLocalDateString } from "@/lib/utils";

export async function logWorkout(formData: WorkoutLogFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = workoutLogSchema.parse(formData);

  // Calculate total duration & calories if not provided
  const totalDuration =
    validated.durationMinutes ||
    validated.exercises.reduce((sum, e) => sum + (e.durationMinutes || 0), 0);
  const totalCalories =
    validated.caloriesBurned ||
    validated.exercises.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);

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
