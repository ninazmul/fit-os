import { Schema, model, models } from "mongoose";

const SleepLogSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    sleepTime: { type: String, required: true },  // HH:mm
    wakeTime: { type: String, required: true },   // HH:mm
    totalHours: { type: Number, required: true },
    quality: { type: Number, min: 1, max: 5, default: 3 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

SleepLogSchema.index({ clerkId: 1, date: -1 }, { unique: true });

const SleepLog = models.SleepLog || model("SleepLog", SleepLogSchema);

export default SleepLog;
