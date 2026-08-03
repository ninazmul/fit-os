import { Schema, model, models } from "mongoose";

const ExerciseSetSchema = new Schema({
  setNumber: { type: Number, required: true },
  reps: { type: Number, required: true, default: 0 },
  weight: { type: Number, required: true, default: 0 }, // kg
  isPersonalRecord: { type: Boolean, default: false },
});

const WorkoutExerciseSchema = new Schema({
  exerciseName: { type: String, required: true },
  sets: [ExerciseSetSchema],
  durationMinutes: { type: Number, default: 0 },
  distanceKm: { type: Number, default: 0 },
  caloriesBurned: { type: Number, default: 0 },
  notes: { type: String, default: "" },
});

const WorkoutLogSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    title: { type: String, required: true },
    workoutType: {
      type: String,
      enum: ["push", "pull", "legs", "upper", "lower", "full_body", "cardio", "custom"],
      default: "custom",
    },
    exercises: [WorkoutExerciseSchema],
    durationMinutes: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

WorkoutLogSchema.index({ clerkId: 1, date: -1 });

const WorkoutLog = models.WorkoutLog || model("WorkoutLog", WorkoutLogSchema);

export default WorkoutLog;
