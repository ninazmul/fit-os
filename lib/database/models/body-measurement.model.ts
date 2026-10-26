import { Schema, model, models } from "mongoose";

const BodyMeasurementSchema = new Schema(
  {
    clerkId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    waist: { type: Number },    // cm
    chest: { type: Number },    // cm
    hip: { type: Number },      // cm
    neck: { type: Number },     // cm
    shoulder: { type: Number }, // cm
    arm: { type: Number },      // cm
    forearm: { type: Number },  // cm
    thigh: { type: Number },    // cm
    calf: { type: Number },     // cm
  },
  { timestamps: true }
);

// Upserted one-per-day on `{clerkId, date}`. This single index covers every
// read (latest/earliest/range/list) and all date-ordered sorts.
BodyMeasurementSchema.index({ clerkId: 1, date: -1 });

const BodyMeasurement =
  models.BodyMeasurement || model("BodyMeasurement", BodyMeasurementSchema);

export default BodyMeasurement;
