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
};

export async function getFoods(query?: string, category?: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {
    $or: [{ isCustom: false }, { clerkId: user.id }],
  };

  if (query) {
    filter.name = { $regex: query, $options: "i" };
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  let dbFoods = (await Food.find(filter)
    .select("name category servingSize calories protein carbs fat fiber isBangladeshi isCustom")
    .sort({ name: 1 })
    .limit(100)
    .lean()) as unknown as FoodListItem[];

  if (dbFoods.length === 0 && !query && (!category || category === "all")) {
    dbFoods = defaultFoods.slice(0, 100);
  } else if (dbFoods.length === 0 && query) {
    const qLower = query.toLowerCase();
    dbFoods = defaultFoods
      .filter((f) => f.name.toLowerCase().includes(qLower))
      .slice(0, 100);
  }

  return JSON.parse(JSON.stringify(dbFoods));
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
  return JSON.parse(JSON.stringify(food));
}

export async function updateCustomFood(foodId: string, formData: FoodFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = foodSchema.parse(formData);
  const food = await Food.findOneAndUpdate(
    { _id: foodId, clerkId: user.id, isCustom: true },
    { ...validated },
    { new: true }
  );

  revalidatePath("/diet");
  return JSON.parse(JSON.stringify(food));
}

export async function deleteCustomFood(foodId: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await Food.findOneAndDelete({ _id: foodId, clerkId: user.id, isCustom: true });
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
