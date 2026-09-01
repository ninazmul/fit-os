import { Schema, model, models } from "mongoose";

const WeightLogSchema = new Schema(
  {
    clerkId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    weight: { type: Number, required: true }, // kg
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

WeightLogSchema.index({ clerkId: 1, date: -1 }, { unique: true });
WeightLogSchema.index({ clerkId: 1, date: 1 });

const WeightLog = models.WeightLog || model("WeightLog", WeightLogSchema);

export default WeightLog;
