import { Schema, model, models } from "mongoose";

const ExerciseSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ["chest", "back", "legs", "shoulders", "arms", "core", "cardio", "full_body"],
      default: "full_body",
    },
    primaryMuscle: { type: String, default: "" },
    equipment: { type: String, default: "bodyweight" }, // barbell, dumbbell, machine, bodyweight, cable
    instructions: { type: String, default: "" },
    isDefault: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Exercise = models.Exercise || model("Exercise", ExerciseSchema);

export default Exercise;
