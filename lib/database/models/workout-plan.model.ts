import { Schema, model, models } from "mongoose";

const WorkoutPlanExerciseSchema = new Schema(
  {
    exerciseName: { type: String, required: true },
    sets: { type: Number, required: true, default: 3 },
    reps: { type: Number, required: true, default: 10 },
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
    clerkId: { type: String, required: true, unique: true, index: true },
    days: [WorkoutPlanDaySchema],
  },
  { timestamps: true },
);

WorkoutPlanSchema.index({ clerkId: 1, "days.dayOfWeek": 1 });

const WorkoutPlan =
  models.WorkoutPlan || model("WorkoutPlan", WorkoutPlanSchema);

export default WorkoutPlan;
