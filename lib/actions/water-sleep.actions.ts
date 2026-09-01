"use server";

import { connectToDatabase } from "@/lib/database";
import WaterLog from "@/lib/database/models/water-log.model";
import SleepLog from "@/lib/database/models/sleep-log.model";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { waterEntrySchema, sleepSessionSchema } from "@/validations/fitness";
import { getLocalDateString } from "@/lib/utils";
import type { IWaterEntry, ISleepSession } from "@/types/fitness";

function nowHHmm(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function recalcWaterTotals(entries: IWaterEntry[]) {
  const totalMl = entries.reduce((s, e) => s + Number(e.amountMl || 0), 0);
  return { totalMl };
}

function recalcSleepTotals(sessions: ISleepSession[]) {
  if (sessions.length === 0) {
    return { totalHours: 0, avgQuality: 0 };
  }
  const totalHours = sessions.reduce(
    (s, ses) => s + Number(ses.totalHours || 0),
    0,
  );
  const avgQuality =
    sessions.reduce((s, ses) => s + Number(ses.quality || 0), 0) /
    sessions.length;
  return {
    totalHours: Math.round(totalHours * 10) / 10,
    avgQuality: Math.round(avgQuality * 10) / 10,
  };
}

// ───────────────── Water ─────────────────

export async function addWater(amountMl: number, date?: string, time?: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const entry = waterEntrySchema.parse({
    amountMl,
    time: time || nowHHmm(),
  });

  const useDate = date || getLocalDateString();

  const raw = await WaterLog.findOne({
    clerkId: user.id,
    date: useDate,
  }).lean();
  const entries: IWaterEntry[] = raw?.entries
    ? [...(raw.entries as IWaterEntry[])]
    : [];
  entries.push({
    amountMl: entry.amountMl,
    time: entry.time || nowHHmm(),
  });
  const totals = recalcWaterTotals(entries);

  await WaterLog.findOneAndUpdate(
    { clerkId: user.id, date: useDate },
    { entries, ...totals },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath("/diet");
  revalidatePath("/analytics");
  return { date: useDate, entries, ...totals };
}

export async function removeWaterEntry(entryIndex: number, date?: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const useDate = date || getLocalDateString();
  const raw = await WaterLog.findOne({
    clerkId: user.id,
    date: useDate,
  }).lean();
  if (!raw) return { date: useDate, entries: [], totalMl: 0 };

  const entries = (raw.entries as IWaterEntry[]).slice();
  if (entryIndex >= 0 && entryIndex < entries.length) {
    entries.splice(entryIndex, 1);
  }

  const totals = recalcWaterTotals(entries);
  if (entries.length === 0) {
    await WaterLog.findOneAndDelete({ clerkId: user.id, date: useDate });
  } else {
    await WaterLog.findOneAndUpdate(
      { clerkId: user.id, date: useDate },
      { entries, ...totals },
    );
  }

  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath("/diet");
  revalidatePath("/analytics");
  return { date: useDate, entries, ...totals };
}

export async function getWaterLogForDate(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const log = await WaterLog.findOne({ clerkId: user.id, date }).lean();
  if (!log) return { entries: [], totalMl: 0 };
  const entries = (log.entries as IWaterEntry[]).slice().sort((a, b) => {
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    return 0;
  });
  const totals = recalcWaterTotals(entries);
  return { _id: (log as { _id?: string })._id, entries, ...totals };
}

export async function getWaterHistory(days: number = 7) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = getLocalDateString(startDate);

  const logs = await WaterLog.find({
    clerkId: user.id,
    date: { $gte: startStr },
  })
    .sort({ date: 1 })
    .lean();

  return logs.map((l) => ({
    _id: (l as { _id: string })._id,
    date: l.date,
    entries: (l.entries as IWaterEntry[]) || [],
    totalMl:
      Number(l.totalMl) ||
      recalcWaterTotals(l.entries as IWaterEntry[]).totalMl,
  }));
}

// ───────────────── Sleep ─────────────────

export async function addSleepSession(
  data: {
    date?: string;
    sleepTime: string;
    wakeTime: string;
    totalHours: number;
    quality?: number;
    notes?: string;
  },
  dateOverride?: string,
) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const session = sleepSessionSchema.parse({
    sleepTime: data.sleepTime,
    wakeTime: data.wakeTime,
    totalHours: data.totalHours,
    quality: data.quality ?? 3,
    notes: data.notes ?? "",
  });

  const useDate = dateOverride || data.date || getLocalDateString();

  const raw = (await SleepLog.findOne({
    clerkId: user.id,
    date: useDate,
  }).lean()) as { sessions?: ISleepSession[] } | null;
  const sessions: ISleepSession[] = raw?.sessions ? [...raw.sessions] : [];
  sessions.push({
    sleepTime: session.sleepTime,
    wakeTime: session.wakeTime,
    totalHours: session.totalHours,
    quality: session.quality ?? 3,
    notes: session.notes,
  });
  const totals = recalcSleepTotals(sessions);

  await SleepLog.findOneAndUpdate(
    { clerkId: user.id, date: useDate },
    { sessions, ...totals },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath("/analytics");
  return { date: useDate, sessions, ...totals };
}

export async function removeSleepSession(sessionIndex: number, date?: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const useDate = date || getLocalDateString();
  const raw = (await SleepLog.findOne({
    clerkId: user.id,
    date: useDate,
  }).lean()) as { sessions?: ISleepSession[] } | null;
  if (!raw || !raw.sessions)
    return { date: useDate, sessions: [], totalHours: 0, avgQuality: 0 };

  const sessions = raw.sessions.slice();
  if (sessionIndex >= 0 && sessionIndex < sessions.length) {
    sessions.splice(sessionIndex, 1);
  }

  const totals = recalcSleepTotals(sessions);
  if (sessions.length === 0) {
    await SleepLog.findOneAndDelete({ clerkId: user.id, date: useDate });
  } else {
    await SleepLog.findOneAndUpdate(
      { clerkId: user.id, date: useDate },
      { sessions, ...totals },
    );
  }

  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath("/analytics");
  return { date: useDate, sessions, ...totals };
}

export async function logSleep(data: {
  date: string;
  sleepTime: string;
  wakeTime: string;
  totalHours: number;
  quality: number;
  notes?: string;
}) {
  return addSleepSession(data);
}

export async function getSleepLogForDate(date: string) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const log = (await SleepLog.findOne({ clerkId: user.id, date }).lean()) as {
    sessions?: ISleepSession[];
    _id?: string;
    totalHours?: number | string;
    avgQuality?: number | string;
  } | null;
  if (!log || !log.sessions)
    return { sessions: [], totalHours: 0, avgQuality: 0 };
  const sessions = log.sessions.slice().sort((a, b) => {
    if (a.sleepTime < b.sleepTime) return -1;
    if (a.sleepTime > b.sleepTime) return 1;
    return 0;
  });
  const totals = recalcSleepTotals(sessions);
  return { _id: log._id, sessions, ...totals };
}

export async function getSleepHistory(days: number = 7) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = getLocalDateString(startDate);

  const logs = await SleepLog.find({
    clerkId: user.id,
    date: { $gte: startStr },
  })
    .sort({ date: 1 })
    .lean();

  return logs.map((l) => {
    const sessions = (l.sessions as ISleepSession[]) || [];
    const totals =
      Number(l.totalHours) > 0
        ? {
            totalHours: Number(l.totalHours),
            avgQuality: Number(l.avgQuality) || 0,
          }
        : recalcSleepTotals(sessions);
    return {
      _id: (l as { _id: string })._id,
      date: l.date,
      sessions,
      ...totals,
    };
  });
}
