"use server";

import { connectToDatabase } from "@/lib/database";
import WaterLog from "@/lib/database/models/water-log.model";
import SleepLog from "@/lib/database/models/sleep-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ───────────────── Water ─────────────────

export async function addWater(date: string, amountMl: number) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Upsert: increment today's water
  const log = await WaterLog.findOneAndUpdate(
    { clerkId: user.id, date },
    { $inc: { amountMl } },
    { new: true, upsert: true }
  );

  revalidatePath("/");
  return JSON.parse(JSON.stringify(log));
}

export async function getWaterLogForDate(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const log = await WaterLog.findOne({ clerkId: user.id, date });
  return log ? JSON.parse(JSON.stringify(log)) : { amountMl: 0 };
}

export async function getWaterHistory(days: number = 7) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split("T")[0];

  const logs = await WaterLog.find({
    clerkId: user.id,
    date: { $gte: startStr },
  }).sort({ date: 1 });

  return JSON.parse(JSON.stringify(logs));
}

// ───────────────── Sleep ─────────────────

export async function logSleep(data: {
  date: string;
  sleepTime: string;
  wakeTime: string;
  totalHours: number;
  quality: number;
  notes?: string;
}) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const log = await SleepLog.findOneAndUpdate(
    { clerkId: user.id, date: data.date },
    { ...data, clerkId: user.id },
    { new: true, upsert: true }
  );

  revalidatePath("/");
  revalidatePath("/progress");
  return JSON.parse(JSON.stringify(log));
}

export async function getSleepLogForDate(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const log = await SleepLog.findOne({ clerkId: user.id, date });
  return log ? JSON.parse(JSON.stringify(log)) : null;
}

export async function getSleepHistory(days: number = 7) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split("T")[0];

  const logs = await SleepLog.find({
    clerkId: user.id,
    date: { $gte: startStr },
  }).sort({ date: 1 });

  return JSON.parse(JSON.stringify(logs));
}
