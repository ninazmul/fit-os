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
  if (!user) throw new Error("Unauthorized");

  const workouts = await WorkoutLog.find({ clerkId: user.id }).lean();

  // Aggregate PRs: for each exercise, find max weight * reps
  const prMap: Record<string, { weight: number; reps: number; date: string }> = {};

  workouts.forEach((w) => {
    w.exercises.forEach(
      (ex: { exerciseName: string; sets: Array<{ weight: number; reps: number }> }) => {
        ex.sets.forEach((set: { weight: number; reps: number }) => {
          const key = ex.exerciseName.toLowerCase();
          const volume = set.weight * set.reps;
          if (!prMap[key] || volume > prMap[key].weight * prMap[key].reps) {
            prMap[key] = {
              weight: set.weight,
              reps: set.reps,
              date: w.date,
            };
          }
        });
      }
    );
  });

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
