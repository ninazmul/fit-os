import { Schema, model, models } from "mongoose";

const MeasurementsSummarySchema = new Schema(
  {
    waistChange: { type: Number },
    chestChange: { type: Number },
    hipChange: { type: Number },
  },
  { _id: false },
);

const GoalHistorySchema = new Schema(
  {
    clerkId: { type: String, required: true },
    goal: {
      type: String,
      enum: ["lose_weight", "gain_muscle", "maintain"],
      required: true,
    },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    completedDate: { type: String, required: true }, // YYYY-MM-DD
    startWeight: { type: Number, required: true }, // kg
    achievedWeight: { type: Number, required: true }, // kg
    targetWeight: { type: Number, required: true }, // kg
    weightChange: { type: Number, required: true }, // kg (e.g. -5.2 or +3.0)
    daysActive: { type: Number, required: true },
    totalWorkoutsLogged: { type: Number, default: 0 },
    totalMealsLogged: { type: Number, default: 0 },
    measurementsSummary: { type: MeasurementsSummarySchema, default: {} },
    headline: { type: String, required: true },
    achievementBadge: { type: String, default: "🏆 Goal Crusher" },
  },
  { timestamps: true },
);

GoalHistorySchema.index({ clerkId: 1, completedDate: -1 });

const GoalHistory =
  models.GoalHistory || model("GoalHistory", GoalHistorySchema);

export default GoalHistory;
