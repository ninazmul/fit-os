"use server";

import { connectToDatabase } from "@/lib/database";
import MealLog from "@/lib/database/models/meal-log.model";
import { currentUser } from "@clerk/nextjs/server";
import type { IMealItem } from "@/types/fitness";

export async function getRecentFoods(limit: number = 8): Promise<IMealItem[]> {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return [];

  const recentLogs = await MealLog.find({ clerkId: user.id })
    .sort({ createdAt: -1, date: -1 })
    .limit(20)
    .lean();

  const seen = new Set<string>();
  const recentItems: IMealItem[] = [];

  for (const log of recentLogs) {
    if (Array.isArray(log.items)) {
      for (const item of log.items) {
        const key = item.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          recentItems.push({
            foodId: item.foodId,
            name: item.name,
            serving: item.serving || "1 serving",
            quantity: 1,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber || 0,
          });
          if (recentItems.length >= limit) break;
        }
      }
    }
    if (recentItems.length >= limit) break;
  }

  return JSON.parse(JSON.stringify(recentItems));
}
