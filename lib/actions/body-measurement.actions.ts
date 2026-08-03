"use server";

import { connectToDatabase } from "@/lib/database";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function logBodyMeasurement(data: {
  date: string;
  waist?: number;
  chest?: number;
  hip?: number;
  neck?: number;
  shoulder?: number;
  arm?: number;
  forearm?: number;
  thigh?: number;
  calf?: number;
}) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Strip empty/undefined values
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== "")
  );

  const measurement = await BodyMeasurement.findOneAndUpdate(
    { clerkId: user.id, date: data.date },
    { ...cleaned, clerkId: user.id },
    { new: true, upsert: true }
  );

  revalidatePath("/progress");
  return JSON.parse(JSON.stringify(measurement));
}

export async function getBodyMeasurements(limit: number = 10) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const measurements = await BodyMeasurement.find({ clerkId: user.id })
    .sort({ date: -1 })
    .limit(limit);

  return JSON.parse(JSON.stringify(measurements));
}

export async function getLatestBodyMeasurement() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const measurement = await BodyMeasurement.findOne({ clerkId: user.id }).sort({
    date: -1,
  });

  return measurement ? JSON.parse(JSON.stringify(measurement)) : null;
}
