import { Schema, model, models } from "mongoose";

const PersonalRecordSchema = new Schema(
  {
    clerkId: { type: String, required: true },
    exerciseName: { type: String, required: true, trim: true },
    weight: { type: Number, required: true, min: 0 }, // kg
    reps: { type: Number, required: true, min: 1 },
    date: { type: String, required: true }, // YYYY-MM-DD
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

// PR lookup by exercise name, and latest-first listing.
PersonalRecordSchema.index({ clerkId: 1, exerciseName: 1 });
PersonalRecordSchema.index({ clerkId: 1, date: -1 });

const PersonalRecord =
  models.PersonalRecord || model("PersonalRecord", PersonalRecordSchema);

export default PersonalRecord;
