"use server";

import { connectToDatabase } from "@/lib/database";
import Food from "@/lib/database/models/food.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { foodSchema, type FoodFormValues } from "@/validations/fitness";

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

  const foods = await Food.find(filter).sort({ name: 1 }).limit(100);
  return JSON.parse(JSON.stringify(foods));
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

export async function deleteCustomFood(foodId: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await Food.findOneAndDelete({ _id: foodId, clerkId: user.id, isCustom: true });
  revalidatePath("/diet");
}

/** Seed Bangladeshi & common foods — run once on admin / setup */
export async function seedFoods() {
  await connectToDatabase();

  const existingCount = await Food.countDocuments({ isBangladeshi: true });
  if (existingCount > 0) return { message: "Foods already seeded", count: existingCount };

  const foods = [
    // Rice & Grains
    { name: "Rice (White, cooked)", category: "rice_grains", servingSize: "1 plate (250g)", calories: 325, protein: 6.5, carbs: 71, fat: 0.7, fiber: 0.6, isBangladeshi: true },
    { name: "Polao", category: "rice_grains", servingSize: "1 plate (250g)", calories: 450, protein: 9, carbs: 68, fat: 15, fiber: 1.2, isBangladeshi: true },
    { name: "Khichuri", category: "rice_grains", servingSize: "1 plate (300g)", calories: 380, protein: 12, carbs: 58, fat: 10, fiber: 4, isBangladeshi: true },
    { name: "Morog Polao", category: "rice_grains", servingSize: "1 plate (350g)", calories: 580, protein: 25, carbs: 65, fat: 22, fiber: 1.5, isBangladeshi: true },
    { name: "Kacchi Biryani", category: "rice_grains", servingSize: "1 plate (400g)", calories: 720, protein: 30, carbs: 72, fat: 32, fiber: 2, isBangladeshi: true },
    { name: "Oats", category: "rice_grains", servingSize: "1 cup (80g)", calories: 307, protein: 11, carbs: 55, fat: 5.3, fiber: 8, isBangladeshi: false },

    // Curry & Meat
    { name: "Dal (Lentil Soup)", category: "curry_meat", servingSize: "1 bowl (200ml)", calories: 180, protein: 12, carbs: 28, fat: 3, fiber: 8, isBangladeshi: true },
    { name: "Chicken Curry", category: "curry_meat", servingSize: "1 serving (200g)", calories: 320, protein: 28, carbs: 8, fat: 20, fiber: 1, isBangladeshi: true },
    { name: "Beef Curry", category: "curry_meat", servingSize: "1 serving (200g)", calories: 380, protein: 32, carbs: 6, fat: 26, fiber: 0.5, isBangladeshi: true },
    { name: "Chicken Grill", category: "curry_meat", servingSize: "1 piece (150g)", calories: 250, protein: 38, carbs: 2, fat: 10, fiber: 0, isBangladeshi: true },
    { name: "Chicken Roast", category: "curry_meat", servingSize: "1 piece (150g)", calories: 280, protein: 35, carbs: 5, fat: 14, fiber: 0.5, isBangladeshi: true },
    { name: "Chickpeas (Chole)", category: "curry_meat", servingSize: "1 bowl (150g)", calories: 210, protein: 11, carbs: 33, fat: 4, fiber: 9, isBangladeshi: true },

    // Fish & Seafood
    { name: "Fish Curry (Ilish)", category: "fish_seafood", servingSize: "1 piece (120g)", calories: 280, protein: 22, carbs: 4, fat: 20, fiber: 0.5, isBangladeshi: true },
    { name: "Fish (Rohu, fried)", category: "fish_seafood", servingSize: "1 piece (100g)", calories: 220, protein: 24, carbs: 5, fat: 12, fiber: 0, isBangladeshi: true },

    // Bread & Bakery
    { name: "Naan", category: "bread_bakery", servingSize: "1 piece (90g)", calories: 260, protein: 8, carbs: 45, fat: 5, fiber: 2, isBangladeshi: true },
    { name: "Paratha", category: "bread_bakery", servingSize: "1 piece (80g)", calories: 280, protein: 5, carbs: 36, fat: 13, fiber: 1.5, isBangladeshi: true },
    { name: "Roti", category: "bread_bakery", servingSize: "1 piece (40g)", calories: 104, protein: 3, carbs: 18, fat: 3, fiber: 2, isBangladeshi: true },

    // Dairy & Eggs
    { name: "Egg (Whole, boiled)", category: "dairy_eggs", servingSize: "1 large", calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, isBangladeshi: true },
    { name: "Boiled Egg White", category: "dairy_eggs", servingSize: "1 large", calories: 17, protein: 3.6, carbs: 0.2, fat: 0.1, fiber: 0, isBangladeshi: false },
    { name: "Sweet Yogurt (Mishti Doi)", category: "dairy_eggs", servingSize: "1 cup (150g)", calories: 180, protein: 5, carbs: 30, fat: 5, fiber: 0, isBangladeshi: true },
    { name: "Plain Yogurt", category: "dairy_eggs", servingSize: "1 cup (150g)", calories: 95, protein: 8, carbs: 11, fat: 2, fiber: 0, isBangladeshi: true },
    { name: "Milk (Whole)", category: "dairy_eggs", servingSize: "1 glass (250ml)", calories: 150, protein: 8, carbs: 12, fat: 8, fiber: 0, isBangladeshi: true },

    // Fruits & Vegetables
    { name: "Banana", category: "fruits_veg", servingSize: "1 medium", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, isBangladeshi: false },
    { name: "Apple", category: "fruits_veg", servingSize: "1 medium", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, isBangladeshi: false },
  ];

  await Food.insertMany(
    foods.map((f) => ({ ...f, isCustom: false }))
  );

  return { message: "Foods seeded successfully", count: foods.length };
}
