import { Schema, model, models } from "mongoose";

const WaterLogSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    amountMl: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

WaterLogSchema.index({ clerkId: 1, date: 1 });

const WaterLog = models.WaterLog || model("WaterLog", WaterLogSchema);

export default WaterLog;
