import { Schema, model, models } from "mongoose";

const SavedMealItemSchema = new Schema(
  {
    foodId: { type: String },
    name: { type: String, required: true },
    serving: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
  },
  { _id: false }
);

const SavedMealSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "breakfast",
        "lunch",
        "dinner",
        "iftar",
        "gym_meal",
        "cheat_meal",
        "office_lunch",
        "custom",
      ],
      default: "custom",
    },
    items: [SavedMealItemSchema],
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalFiber: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for efficient querying
SavedMealSchema.index({ clerkId: 1, usageCount: -1 });

const SavedMeal =
  models.SavedMeal || model("SavedMeal", SavedMealSchema);

export default SavedMeal;
