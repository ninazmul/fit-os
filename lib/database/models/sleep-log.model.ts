import { Schema, model, models } from "mongoose";

const SleepSessionSchema = new Schema({
  sleepTime: { type: String, required: true }, // HH:mm
  wakeTime: { type: String, required: true }, // HH:mm
  totalHours: { type: Number, required: true },
  quality: { type: Number, min: 1, max: 5, default: 3 },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const SleepLogSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD (wake date)
    sessions: { type: [SleepSessionSchema], default: [] },
    totalHours: { type: Number, default: 0 },
    avgQuality: { type: Number, min: 1, max: 5, default: 0 },
  },
  { timestamps: true },
);

SleepLogSchema.index({ clerkId: 1, date: 1 }, { unique: true });

const SleepLog = models.SleepLog || model("SleepLog", SleepLogSchema);

export default SleepLog;
