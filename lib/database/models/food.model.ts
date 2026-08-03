import { Schema, model, models } from "mongoose";

const FoodSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: [
        "rice_grains",
        "curry_meat",
        "fish_seafood",
        "bread_bakery",
        "dairy_eggs",
        "fruits_veg",
        "sweets_desserts",
        "snacks_beverages",
        "custom",
      ],
      default: "custom",
    },
    servingSize: { type: String, required: true, default: "100g" },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true, default: 0 },
    carbs: { type: Number, required: true, default: 0 },
    fat: { type: Number, required: true, default: 0 },
    fiber: { type: Number, required: true, default: 0 },
    image: { type: String, default: "" },
    isBangladeshi: { type: Boolean, default: false },
    isCustom: { type: Boolean, default: false },
    clerkId: { type: String, index: true },
  },
  { timestamps: true }
);

const Food = models.Food || model("Food", FoodSchema);

export default Food;
