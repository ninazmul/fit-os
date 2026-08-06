"use server";

import { connectToDatabase } from "@/lib/database";
import BodyMeasurement from "@/lib/database/models/body-measurement.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  bodyMeasurementSchema,
  type BodyMeasurementFormValues,
} from "@/validations/fitness";

export async function logBodyMeasurement(data: BodyMeasurementFormValues) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const validated = bodyMeasurementSchema.parse(data);

  const cleaned = Object.fromEntries(
    Object.entries(validated).filter(
      ([, v]) => v !== undefined && v !== "" && v !== null
    )
  );

  const measurement = await BodyMeasurement.findOneAndUpdate(
    { clerkId: user.id, date: validated.date },
    { ...cleaned, clerkId: user.id },
    { new: true, upsert: true }
  );

  revalidatePath("/progress");
  revalidatePath("/profile");
  return JSON.parse(JSON.stringify(measurement));
}

export async function getBodyMeasurements(limit: number = 10) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const measurements = await BodyMeasurement.find({ clerkId: user.id })
    .sort({ date: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(measurements));
}

export async function getLatestBodyMeasurement() {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const measurement = await BodyMeasurement.findOne({ clerkId: user.id }).sort({
    date: -1,
  }).lean();

  return measurement ? JSON.parse(JSON.stringify(measurement)) : null;
}

export async function deleteBodyMeasurement(measurementId: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await BodyMeasurement.findOneAndDelete({
    _id: measurementId,
    clerkId: user.id,
  });

  revalidatePath("/progress");
  revalidatePath("/profile");
}
