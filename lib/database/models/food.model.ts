import { Schema, model, models } from "mongoose";

const FoodSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    category: {
      type: String,
      default: "custom",
      index: true,
    },
    servingSize: { type: String, required: true, default: "100g" },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true, default: 0 },
    carbs: { type: Number, required: true, default: 0 },
    fat: { type: Number, required: true, default: 0 },
    fiber: { type: Number, required: true, default: 0 },
    image: { type: String, default: "" },
    isBangladeshi: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false, index: true },
    clerkId: { type: String, index: true },
  },
  { timestamps: true }
);

FoodSchema.index({ isCustom: 1, clerkId: 1 });
FoodSchema.index({ name: 1, category: 1 });

const Food = models.Food || model("Food", FoodSchema);

export default Food;
