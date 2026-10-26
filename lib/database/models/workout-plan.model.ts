import { Schema, model, models } from "mongoose";

const WorkoutPlanExerciseSchema = new Schema(
  {
    exerciseName: { type: String, required: true },
    trackingMode: {
      type: String,
      enum: ["reps", "time"],
      default: "reps",
    },
    sets: { type: Number, required: true, default: 3 },
    reps: { type: Number, required: true, default: 10 },
    seconds: { type: Number, default: 0 },
    weight: { type: Number, default: 0 }, // working load per set, in kg
    caloriesBurned: { type: Number, default: 0 },
  },
  { _id: true },
);

const WorkoutPlanDaySchema = new Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    title: { type: String, required: true },
    exercises: [WorkoutPlanExerciseSchema],
    estimatedDurationMinutes: { type: Number, default: 0 },
    estimatedCaloriesBurned: { type: Number, default: 0 },
  },
  { _id: true },
);

const WorkoutPlanSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
    days: [WorkoutPlanDaySchema],
  },
  { timestamps: true },
);

const WorkoutPlan =
  models.WorkoutPlan || model("WorkoutPlan", WorkoutPlanSchema);

export default WorkoutPlan;
