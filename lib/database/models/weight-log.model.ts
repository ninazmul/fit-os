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

// One entry per user per day. Serves every read (latest/earliest/range/sort).
WeightLogSchema.index({ clerkId: 1, date: -1 }, { unique: true });

const WeightLog = models.WeightLog || model("WeightLog", WeightLogSchema);

export default WeightLog;
