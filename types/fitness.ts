export type Gender = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary" // Little to no exercise
  | "light" // Light exercise 1-3 days/week
  | "moderate" // Moderate exercise 3-5 days/week
  | "active" // Heavy exercise 6-7 days/week
  | "very_active"; // Very heavy exercise, physical job

export type PrimaryGoal = "lose_weight" | "gain_muscle" | "maintain";

export type UnitSystem = "metric" | "imperial";

export interface IUserProfile {
  _id?: string;
  clerkId: string;
  name: string;
  gender: Gender;
  age: number;
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: ActivityLevel;
  goal: PrimaryGoal;
  workoutDaysPerWeek: number;
  waterGoalMl: number;
  dailyCaloriesGoal: number;
  dailyProteinGoal: number;
  dailyFatGoal: number;
  dailyCarbGoal: number;
  dailyFiberGoal: number;
  unitSystem: UnitSystem;
  onboardingCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FoodCategory =
  | "rice_grains"
  | "curry_meat"
  | "fish_seafood"
  | "bread_bakery"
  | "dairy_eggs"
  | "fruits_veg"
  | "sweets_desserts"
  | "snacks_beverages"
  | "custom";

export interface IFood {
  _id?: string;
  name: string;
  category: FoodCategory;
  servingSize: string; // e.g. "1 plate (250g)", "1 piece"
  calories: number;
  protein: number; // in grams
  carbs: number;
  fat: number;
  fiber: number;
  image?: string;
  isBangladeshi?: boolean;
  isCustom?: boolean;
  clerkId?: string; // set if custom
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface IMealItem {
  foodId?: string;
  name: string;
  serving: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface IMealLog {
  _id?: string;
  clerkId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  items: IMealItem[];
  photoUrl?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
}

export interface IWeightLog {
  _id?: string;
  clerkId: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  notes?: string;
}

export interface IBodyMeasurement {
  _id?: string;
  clerkId: string;
  date: string; // YYYY-MM-DD
  waist?: number; // cm
  chest?: number; // cm
  hip?: number; // cm
  neck?: number; // cm
  shoulder?: number; // cm
  arm?: number; // cm
  forearm?: number; // cm
  thigh?: number; // cm
  calf?: number; // cm
}

export type WorkoutType =
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full_body"
  | "cardio"
  | "custom";

export interface IExerciseSet {
  setNumber: number;
  reps: number;
  weight: number; // in kg
  isPersonalRecord?: boolean;
}

export interface IWorkoutExercise {
  exerciseName: string;
  sets: IExerciseSet[];
  durationMinutes?: number;
  distanceKm?: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface IWorkoutLog {
  _id?: string;
  clerkId: string;
  date: string; // YYYY-MM-DD
  title: string;
  workoutType: WorkoutType;
  exercises: IWorkoutExercise[];
  durationMinutes: number;
  caloriesBurned: number;
  notes?: string;
}

export interface IWaterEntry {
  amountMl: number;
  time: string; // HH:mm
  createdAt?: Date | string;
}

export interface IWaterLog {
  _id?: string;
  clerkId: string;
  date: string; // YYYY-MM-DD
  entries: IWaterEntry[];
  totalMl: number;
}

export interface ISleepSession {
  sleepTime: string; // HH:mm
  wakeTime: string; // HH:mm
  totalHours: number;
  quality: number; // 1-5
  notes?: string;
  createdAt?: Date | string;
}

export interface ISleepLog {
  _id?: string;
  clerkId: string;
  date: string; // YYYY-MM-DD (wake date)
  sessions: ISleepSession[];
  totalHours: number;
  avgQuality: number;
}

export interface IProgressPhoto {
  _id?: string;
  clerkId: string;
  date: string;
  angle: "front" | "side" | "back";
  photoUrl: string;
  weight?: number;
}

export interface IDailySummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterMl: number;
  weight?: number;
  workoutDone: boolean;
  sleepHours?: number;
}

export interface AIInsight {
  id: string;
  type: "warning" | "success" | "info" | "tip";
  title: string;
  description: string;
  actionableText?: string;
}
