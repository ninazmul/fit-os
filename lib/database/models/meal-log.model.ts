import { Schema, model, models } from "mongoose";

const MealItemSchema = new Schema({
  foodId: { type: String },
  name: { type: String, required: true },
  serving: { type: String, default: "1 serving" },
  quantity: { type: Number, default: 1 },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
});

const MealLogSchema = new Schema(
  {
    // Single-field indexes removed — subsumed by compound indexes below
    clerkId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    items: [MealItemSchema],
    photoUrl: { type: String, default: "" },
    totalCalories: { type: Number, default: 0 },
    totalProtein: { type: Number, default: 0 },
    totalCarbs: { type: Number, default: 0 },
    totalFat: { type: Number, default: 0 },
    totalFiber: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Primary upsert key: logMeal / appendMealItem / getDailyNutritionSummary
MealLogSchema.index({ clerkId: 1, date: 1, mealType: 1 }, { unique: true });
// Range queries: getMealLogsForRange, dashboard weekly, insights, AI actions
MealLogSchema.index({ clerkId: 1, date: 1 });
// Recent-foods query: MealLog.find({clerkId}).sort({createdAt:-1}).limit(20)
MealLogSchema.index({ clerkId: 1, createdAt: -1 });

const MealLog = models.MealLog || model("MealLog", MealLogSchema);

export default MealLog;
