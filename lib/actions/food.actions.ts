"use server";

import { connectToDatabase } from "@/lib/database";
import Food from "@/lib/database/models/food.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { foodSchema, type FoodFormValues } from "@/validations/fitness";
import { foods as defaultFoods, type FoodItem } from "@/public/foods";

type FoodListItem = FoodItem & {
  _id?: string;
  isCustom?: boolean;
  clerkId?: string;
  isOwner?: boolean;
};

export async function getFoods(query?: string, category?: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Allow all users to access both standard foods and community custom foods
  const conditions: Record<string, unknown>[] = [];

  if (query && query.trim()) {
    conditions.push({
      name: { $regex: query.trim(), $options: "i" },
    });
  }

  if (category && category !== "all") {
    if (category === "custom") {
      conditions.push({ isCustom: true });
    } else {
      conditions.push({
        $or: [{ category }, { displayCategory: category }],
      });
    }
  }

  const filter =
    conditions.length === 0
      ? {}
      : conditions.length === 1
        ? conditions[0]
        : { $and: conditions };

  let dbFoods = (await Food.find(filter)
    .select(
      "name category displayCategory servingSize calories protein carbs fat fiber isBangladeshi isCustom clerkId"
    )
    .sort({ isCustom: -1, name: 1 })
    .limit(100)
    .lean()) as unknown as FoodListItem[];

  if (dbFoods.length === 0) {
    let filtered = defaultFoods;
    if (category && category !== "all") {
      filtered = filtered.filter(
        (f) => f.category === category || f.displayCategory === category
      );
    }
    if (query) {
      const qLower = query.toLowerCase();
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(qLower));
    }
    dbFoods = filtered.slice(0, 100);
  }

  // Set isOwner to true only if food is custom and was created by current user
  const foodsWithOwnership = dbFoods.map((f) => ({
    ...f,
    _id: f._id ? String(f._id) : undefined,
    isOwner: Boolean(f.isCustom && f.clerkId && f.clerkId === user.id),
  }));

  return JSON.parse(JSON.stringify(foodsWithOwnership));
}

export async function createCustomFood(formData: FoodFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = foodSchema.parse(formData);
  const food = await Food.create({
    ...validated,
    isCustom: true,
    isBangladeshi: false,
    clerkId: user.id,
  });

  revalidatePath("/diet");
  const result = JSON.parse(JSON.stringify(food));
  return { ...result, isOwner: true };
}

export async function updateCustomFood(
  foodId: string,
  formData: FoodFormValues
) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const existingFood = await Food.findById(foodId);
  if (!existingFood) {
    throw new Error("Food not found");
  }

  // Only the original creator can edit their custom food
  if (!existingFood.isCustom || existingFood.clerkId !== user.id) {
    throw new Error(
      "Unauthorized: You can only edit custom foods that you created."
    );
  }

  const validated = foodSchema.parse(formData);
  const updatedFood = await Food.findByIdAndUpdate(
    foodId,
    { ...validated },
    { new: true }
  );

  revalidatePath("/diet");
  return JSON.parse(JSON.stringify(updatedFood));
}

export async function deleteCustomFood(foodId: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const existingFood = await Food.findById(foodId);
  if (!existingFood) {
    throw new Error("Food not found");
  }

  // Only the original creator can delete their custom food
  if (!existingFood.isCustom || existingFood.clerkId !== user.id) {
    throw new Error(
      "Unauthorized: You can only delete custom foods that you created."
    );
  }

  await Food.findByIdAndDelete(foodId);
  revalidatePath("/diet");
}

export async function seedFoods() {
  await connectToDatabase();

  const existingCount = await Food.countDocuments({ isCustom: false });
  if (existingCount >= defaultFoods.length) {
    return { message: "Foods already seeded", count: existingCount };
  }

  const bulkOps = defaultFoods.map((f) => ({
    updateOne: {
      filter: { name: f.name, servingSize: f.servingSize, isCustom: false },
      update: { $setOnInsert: { ...f, isCustom: false } },
      upsert: true,
    },
  }));

  await Food.bulkWrite(bulkOps);
  const totalCount = await Food.countDocuments({ isCustom: false });

  return { message: "Foods seeded successfully", count: totalCount };
}
