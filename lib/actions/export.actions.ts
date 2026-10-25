"use server";

import { currentUser } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/database";
import UserProfile from "@/lib/database/models/user-profile.model";
import MealLog from "@/lib/database/models/meal-log.model";
import WorkoutLog from "@/lib/database/models/workout-log.model";
import WorkoutPlan from "@/lib/database/models/workout-plan.model";
import WeightLog from "@/lib/database/models/weight-log.model";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import SleepLog from "@/lib/database/models/sleep-log.model";
import WaterLog from "@/lib/database/models/water-log.model";
import Food from "@/lib/database/models/food.model";
import SavedMeal from "@/lib/database/models/saved-meal.model";
import { APP_NAME, APP_VERSION } from "@/lib/constants";

/**
 * Exports every record that belongs to the signed-in user (scoped by Clerk id).
 * Returns a pre-serialized JSON string so nothing but plain data crosses the
 * server-action boundary.
 */
export async function exportUserData(): Promise<string> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const clerkId = user.id;

  const [
    profile,
    meals,
    workouts,
    workoutPlan,
    weights,
    bodyMeasurements,
    sleep,
    water,
    customFoods,
    savedMeals,
  ] = await Promise.all([
    UserProfile.findOne({ clerkId }).lean(),
    MealLog.find({ clerkId }).sort({ date: -1 }).lean(),
    WorkoutLog.find({ clerkId }).sort({ date: -1 }).lean(),
    WorkoutPlan.findOne({ clerkId }).lean(),
    WeightLog.find({ clerkId }).sort({ date: -1 }).lean(),
    BodyMeasurement.find({ clerkId }).sort({ date: -1 }).lean(),
    SleepLog.find({ clerkId }).sort({ date: -1 }).lean(),
    WaterLog.find({ clerkId }).sort({ date: -1 }).lean(),
    // Only the user's own custom foods — never the shared/seed food database.
    Food.find({ clerkId, isCustom: true }).lean(),
    SavedMeal.find({ clerkId }).sort({ createdAt: -1 }).lean(),
  ]);

  const payload = {
    meta: {
      app: APP_NAME,
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      userId: clerkId,
    },
    profile: profile ?? null,
    meals,
    workouts,
    workoutPlan: workoutPlan ?? null,
    weights,
    bodyMeasurements,
    sleep,
    water,
    customFoods,
    savedMeals,
  };

  return JSON.stringify(payload, null, 2);
}
