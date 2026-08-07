"use server";

import { connectToDatabase } from "@/lib/database";
import MealLog from "@/lib/database/models/meal-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { mealLogSchema, type MealLogFormValues } from "@/validations/fitness";
import type { IMealItem } from "@/types/fitness";

function calcTotals(items: IMealItem[]) {
  const totalCalories = items.reduce(
    (sum, i) => sum + i.calories * i.quantity,
    0,
  );
  const totalProtein = items.reduce(
    (sum, i) => sum + i.protein * i.quantity,
    0,
  );
  const totalCarbs = items.reduce((sum, i) => sum + i.carbs * i.quantity, 0);
  const totalFat = items.reduce((sum, i) => sum + i.fat * i.quantity, 0);
  const totalFiber = items.reduce((sum, i) => sum + i.fiber * i.quantity, 0);
  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    totalFiber: Math.round(totalFiber * 10) / 10,
  };
}

export async function logMeal(formData: MealLogFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = mealLogSchema.parse(formData);
  const totals = calcTotals(validated.items as IMealItem[]);

  const meal = await MealLog.findOneAndUpdate(
    {
      clerkId: user.id,
      date: validated.date,
      mealType: validated.mealType,
    },
    {
      items: validated.items,
      photoUrl: validated.photoUrl || "",
      ...totals,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  revalidatePath("/");
  revalidatePath("/diet");
  return JSON.parse(JSON.stringify(meal));
}

export async function appendMealItem(
  date: string,
  mealType: MealLogFormValues["mealType"],
  item: IMealItem,
) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const existingMeal = await MealLog.findOne({
    clerkId: user.id,
    date,
    mealType,
  }).lean();
  const existingItems = existingMeal
    ? ((existingMeal as unknown as { items: IMealItem[] }).items || [])
    : [];
  const items = [...existingItems, item];
  const totals = calcTotals(items);

  const meal = await MealLog.findOneAndUpdate(
    {
      clerkId: user.id,
      date,
      mealType,
    },
    {
      items,
      photoUrl: (existingMeal as { photoUrl?: string } | null)?.photoUrl || "",
      ...totals,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

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
  })
    .sort({ mealType: 1 })
    .lean();

  return JSON.parse(JSON.stringify(meals));
}

export async function getDailyNutritionSummary(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const meals = await MealLog.find({ clerkId: user.id, date }).lean();

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

export async function removeMealItem(mealId: string, itemIndex: number) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const rawMeal = await MealLog.findOne({
    _id: mealId,
    clerkId: user.id,
  }).lean();
  if (!rawMeal) throw new Error("Meal not found");

  const items = ((rawMeal as unknown as { items: IMealItem[] }).items).slice();
  if (itemIndex < 0 || itemIndex >= items.length) {
    throw new Error("Invalid item index");
  }

  items.splice(itemIndex, 1);

  if (items.length === 0) {
    await MealLog.findOneAndDelete({ _id: mealId, clerkId: user.id });
  } else {
    const totals = calcTotals(items);
    await MealLog.findOneAndUpdate(
      { _id: mealId, clerkId: user.id },
      { items, ...totals },
    );
  }

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
  })
    .sort({ date: -1 })
    .lean();

  return JSON.parse(JSON.stringify(meals));
}
