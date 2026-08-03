import { Schema, model, models } from "mongoose";

const UserProfileSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ["male", "female", "other"], default: "male" },
    age: { type: Number, required: true, default: 25 },
    height: { type: Number, required: true, default: 170 }, // cm
    currentWeight: { type: Number, required: true, default: 70 }, // kg
    targetWeight: { type: Number, required: true, default: 65 }, // kg
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "moderate",
    },
    goal: {
      type: String,
      enum: ["lose_weight", "gain_muscle", "maintain"],
      default: "lose_weight",
    },
    workoutDaysPerWeek: { type: Number, default: 4 },
    waterGoalMl: { type: Number, default: 3000 },
    dailyCaloriesGoal: { type: Number, default: 2000 },
    dailyProteinGoal: { type: Number, default: 150 },
    dailyFatGoal: { type: Number, default: 65 },
    dailyCarbGoal: { type: Number, default: 200 },
    dailyFiberGoal: { type: Number, default: 30 },
    unitSystem: { type: String, enum: ["metric", "imperial"], default: "metric" },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserProfile =
  models.UserProfile || model("UserProfile", UserProfileSchema);

export default UserProfile;
