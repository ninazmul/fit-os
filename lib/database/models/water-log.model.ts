import { Schema, model, models } from "mongoose";

const WaterEntrySchema = new Schema({
  amountMl: { type: Number, required: true },
  time: { type: String, required: true }, // HH:mm 24h
  createdAt: { type: Date, default: Date.now },
});

const WaterLogSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    entries: { type: [WaterEntrySchema], default: [] },
    totalMl: { type: Number, default: 0 },
  },
  { timestamps: true },
);

WaterLogSchema.index({ clerkId: 1, date: 1 }, { unique: true });

const WaterLog = models.WaterLog || model("WaterLog", WaterLogSchema);

export default WaterLog;
