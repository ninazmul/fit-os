import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  gender: z.enum(["male", "female", "other"]),
  age: z.coerce.number().min(10).max(120),
  height: z.coerce.number().min(50).max(300), // cm
  currentWeight: z.coerce.number().min(20).max(500), // kg
  targetWeight: z.coerce.number().min(20).max(500),
  activityLevel: z.enum([
    "sedentary",
    "light",
    "moderate",
    "active",
    "very_active",
  ]),
  goal: z.enum(["lose_weight", "gain_muscle", "maintain"]),
  workoutDaysPerWeek: z.coerce.number().min(0).max(7),
  waterGoalMl: z.coerce.number().min(500).max(10000),
  dailyCaloriesGoal: z.coerce.number().min(800).max(10000),
  dailyProteinGoal: z.coerce.number().min(0).max(500),
  dailyFatGoal: z.coerce.number().min(0).max(500),
  dailyCarbGoal: z.coerce.number().min(0).max(1000),
  dailyFiberGoal: z.coerce.number().min(0).max(100),
  unitSystem: z.enum(["metric", "imperial"]).optional(),
});

export const foodSchema = z.object({
  name: z.string().min(1, "Food name is required").max(200),
  category: z.enum([
    "rice_grains",
    "curry_meat",
    "fish_seafood",
    "bread_bakery",
    "dairy_eggs",
    "fruits_veg",
    "sweets_desserts",
    "snacks_beverages",
    "custom",
  ]),
  servingSize: z.string().min(1, "Serving size is required"),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0),
  image: z.string().optional(),
});

export const mealItemSchema = z.object({
  foodId: z.string().optional(),
  name: z.string().min(1),
  serving: z.string().min(1),
  quantity: z.coerce.number().min(0.1),
  calories: z.coerce.number().min(0),
  protein: z.coerce.number().min(0),
  carbs: z.coerce.number().min(0),
  fat: z.coerce.number().min(0),
  fiber: z.coerce.number().min(0),
});

export const mealLogSchema = z.object({
  date: z.string().min(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  items: z.array(mealItemSchema).min(1, "Add at least one food item"),
  photoUrl: z.string().optional(),
});

export const weightLogSchema = z.object({
  date: z.string().min(1),
  weight: z.coerce.number().min(20).max(500),
  notes: z.string().max(500).optional(),
});

export const bodyMeasurementSchema = z.object({
  date: z.string().min(1),
  waist: z.coerce.number().min(0).optional().or(z.literal("")),
  chest: z.coerce.number().min(0).optional().or(z.literal("")),
  hip: z.coerce.number().min(0).optional().or(z.literal("")),
  neck: z.coerce.number().min(0).optional().or(z.literal("")),
  shoulder: z.coerce.number().min(0).optional().or(z.literal("")),
  arm: z.coerce.number().min(0).optional().or(z.literal("")),
  forearm: z.coerce.number().min(0).optional().or(z.literal("")),
  thigh: z.coerce.number().min(0).optional().or(z.literal("")),
  calf: z.coerce.number().min(0).optional().or(z.literal("")),
});

export const exerciseSetSchema = z.object({
  setNumber: z.coerce.number().min(1),
  reps: z.coerce.number().min(0),
  weight: z.coerce.number().min(0),
  durationSeconds: z.coerce.number().min(0).optional(),
  isPersonalRecord: z.boolean().optional(),
});

export const workoutExerciseSchema = z.object({
  exerciseName: z.string().min(1, "Exercise name required"),
  sets: z.array(exerciseSetSchema).min(1),
  durationMinutes: z.coerce.number().min(0).optional(),
  distanceKm: z.coerce.number().min(0).optional(),
  caloriesBurned: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export const workoutLogSchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1, "Workout title required"),
  workoutType: z.enum([
    "push",
    "pull",
    "legs",
    "upper",
    "lower",
    "full_body",
    "cardio",
    "custom",
  ]),
  exercises: z.array(workoutExerciseSchema).min(1, "Add at least one exercise"),
  durationMinutes: z.coerce.number().min(0).optional(),
  caloriesBurned: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export const workoutPlanExerciseSchema = z.object({
  exerciseName: z.string().min(1, "Exercise name required").max(120),
  trackingMode: z.enum(["reps", "time"]).default("reps"),
  sets: z.coerce.number().min(1).max(20),
  reps: z.coerce.number().min(0).max(200).default(0),
  seconds: z.coerce.number().min(0).max(3600).default(0),
});

export const workoutPlanDaySchema = z.object({
  _id: z.string().optional(),
  dayOfWeek: z.coerce.number().min(0).max(6),
  title: z.string().min(1, "Day title required").max(120),
  exercises: z
    .array(workoutPlanExerciseSchema)
    .min(1, "Add at least one exercise"),
});

export const workoutPlanSchema = z.object({
  days: z.array(workoutPlanDaySchema).min(1).max(7),
});

export const completedWorkoutPlanExerciseSchema = z.object({
  exerciseName: z.string().min(1).max(120),
  trackingMode: z.enum(["reps", "time"]),
  setsCompleted: z.coerce.number().min(0).max(20),
  reps: z.coerce.number().min(0).max(200),
  seconds: z.coerce.number().min(0).max(3600),
});

export const completeWorkoutPlanDaySchema = z.object({
  date: z.string().min(1),
  planDayId: z.string().min(1),
  completedExercises: z.array(completedWorkoutPlanExerciseSchema).min(1),
});

export const waterLogSchema = z.object({
  date: z.string().min(1),
  entries: z.array(
    z.object({
      amountMl: z.coerce.number().min(1).max(5000),
      time: z.string().min(1),
    }),
  ),
});

export const waterEntrySchema = z.object({
  amountMl: z.coerce.number().min(1).max(5000),
  time: z.string().min(1).optional(),
});

export const sleepSessionSchema = z.object({
  sleepTime: z.string().min(1, "Sleep time required"),
  wakeTime: z.string().min(1, "Wake time required"),
  totalHours: z.coerce.number().min(0).max(24),
  quality: z.coerce.number().min(1).max(5).optional(),
  notes: z.string().max(500).optional(),
});

export const sleepLogSchema = z.object({
  date: z.string().min(1),
  sessions: z.array(sleepSessionSchema),
});

export type WaterLogFormValues = z.infer<typeof waterLogSchema>;
export type WaterEntryFormValues = z.infer<typeof waterEntrySchema>;
export type SleepSessionFormValues = z.infer<typeof sleepSessionSchema>;
export type SleepLogFormValues = z.infer<typeof sleepLogSchema>;

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type FoodFormValues = z.infer<typeof foodSchema>;
export type MealLogFormValues = z.infer<typeof mealLogSchema>;
export type WeightLogFormValues = z.infer<typeof weightLogSchema>;
export type BodyMeasurementFormValues = z.infer<typeof bodyMeasurementSchema>;
export type WorkoutLogFormValues = z.infer<typeof workoutLogSchema>;
export type WorkoutPlanFormValues = z.infer<typeof workoutPlanSchema>;
