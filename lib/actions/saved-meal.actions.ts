"use server";

import { connectToDatabase } from "@/lib/database";
import SavedMeal from "@/lib/database/models/saved-meal.model";
import MealLog from "@/lib/database/models/meal-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { IMealItem, MealType, SavedMealCategory } from "@/types/fitness";

export async function createSavedMeal(data: {
  name: string;
  category: SavedMealCategory;
  items: IMealItem[];
}) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const totalCalories = data.items.reduce((s, i) => s + i.calories * i.quantity, 0);
  const totalProtein = data.items.reduce((s, i) => s + i.protein * i.quantity, 0);
  const totalCarbs = data.items.reduce((s, i) => s + i.carbs * i.quantity, 0);
  const totalFat = data.items.reduce((s, i) => s + i.fat * i.quantity, 0);
  const totalFiber = data.items.reduce((s, i) => s + (i.fiber || 0) * i.quantity, 0);

  const savedMeal = await SavedMeal.create({
    clerkId: user.id,
    name: data.name,
    category: data.category,
    items: data.items,
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
  });

  revalidatePath("/diet");
  return JSON.parse(JSON.stringify(savedMeal));
}

export async function getSavedMeals() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return [];

  const savedMeals = await SavedMeal.find({ clerkId: user.id })
    .sort({ usageCount: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(savedMeals));
}

export async function logSavedMeal(savedMealId: string, date: string, mealType: MealType) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const savedMeal = await SavedMeal.findOne({ _id: savedMealId, clerkId: user.id });
  if (!savedMeal) throw new Error("Saved meal template not found");

  // Increment usage count
  savedMeal.usageCount += 1;
  await savedMeal.save();

  // Find existing meal log or create new
  const existingMeal = await MealLog.findOne({
    clerkId: user.id,
    date,
    mealType,
  });

  let newItems = [...savedMeal.items];
  if (existingMeal) {
    newItems = [...existingMeal.items, ...savedMeal.items];
  }

  const totalCalories = newItems.reduce((s, i) => s + i.calories * i.quantity, 0);
  const totalProtein = newItems.reduce((s, i) => s + i.protein * i.quantity, 0);
  const totalCarbs = newItems.reduce((s, i) => s + i.carbs * i.quantity, 0);
  const totalFat = newItems.reduce((s, i) => s + i.fat * i.quantity, 0);
  const totalFiber = newItems.reduce((s, i) => s + (i.fiber || 0) * i.quantity, 0);

  const mealLog = await MealLog.findOneAndUpdate(
    { clerkId: user.id, date, mealType },
    {
      items: newItems,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalFiber: Math.round(totalFiber * 10) / 10,
    },
    { new: true, upsert: true }
  );

  revalidatePath("/");
  revalidatePath("/diet");
  return JSON.parse(JSON.stringify(mealLog));
}

export async function deleteSavedMeal(id: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await SavedMeal.findOneAndDelete({ _id: id, clerkId: user.id });
  revalidatePath("/diet");
}
