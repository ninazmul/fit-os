import { Schema, model, models } from "mongoose";

const ProgressPhotoSchema = new Schema(
  {
    clerkId: { type: String, required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    angle: {
      type: String,
      enum: ["front", "side", "back"],
      required: true,
    },
    photoUrl: { type: String, required: true },
    weight: { type: Number }, // optional weight at time of photo
  },
  { timestamps: true }
);

ProgressPhotoSchema.index({ clerkId: 1, date: -1 });

const ProgressPhoto =
  models.ProgressPhoto || model("ProgressPhoto", ProgressPhotoSchema);

export default ProgressPhoto;
