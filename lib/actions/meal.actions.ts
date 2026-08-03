"use server";

import { connectToDatabase } from "@/lib/database";
import MealLog from "@/lib/database/models/meal-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { mealLogSchema, type MealLogFormValues } from "@/validations/fitness";

export async function logMeal(formData: MealLogFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = mealLogSchema.parse(formData);

  // Calculate totals from items
  const totalCalories = validated.items.reduce((sum, i) => sum + i.calories * i.quantity, 0);
  const totalProtein = validated.items.reduce((sum, i) => sum + i.protein * i.quantity, 0);
  const totalCarbs = validated.items.reduce((sum, i) => sum + i.carbs * i.quantity, 0);
  const totalFat = validated.items.reduce((sum, i) => sum + i.fat * i.quantity, 0);
  const totalFiber = validated.items.reduce((sum, i) => sum + i.fiber * i.quantity, 0);

  const meal = await MealLog.create({
    clerkId: user.id,
    date: validated.date,
    mealType: validated.mealType,
    items: validated.items,
    photoUrl: validated.photoUrl || "",
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
  });

  revalidatePath("/");
  revalidatePath("/diet");
  return JSON.parse(JSON.stringify(meal));
}

export async function getMealLogsForDate(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const meals = await MealLog.find({
    clerkId: user.id,
    date,
  }).sort({ mealType: 1 });

  return JSON.parse(JSON.stringify(meals));
}

export async function getDailyNutritionSummary(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const meals = await MealLog.find({ clerkId: user.id, date });

  const summary = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    mealCount: meals.length,
  };

  meals.forEach((meal) => {
    summary.totalCalories += meal.totalCalories;
    summary.totalProtein += meal.totalProtein;
    summary.totalCarbs += meal.totalCarbs;
    summary.totalFat += meal.totalFat;
    summary.totalFiber += meal.totalFiber;
  });

  return summary;
}

export async function deleteMealLog(mealId: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await MealLog.findOneAndDelete({ _id: mealId, clerkId: user.id });
  revalidatePath("/");
  revalidatePath("/diet");
}

export async function getMealLogsForRange(startDate: string, endDate: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const meals = await MealLog.find({
    clerkId: user.id,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: -1 });

  return JSON.parse(JSON.stringify(meals));
}
