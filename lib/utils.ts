import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleError = (error: unknown) => {
  console.error(error);
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatTime12h(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return time;

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/** Split a total number of seconds into whole minutes and remainder seconds. */
export function splitDuration(totalSeconds: number): {
  minutes: number;
  seconds: number;
} {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return { minutes: Math.floor(safe / 60), seconds: safe % 60 };
}

/** Human-friendly duration label, e.g. 90 -> "1m 30s", 45 -> "45s", 120 -> "2m". */
export function formatDuration(totalSeconds: number): string {
  const { minutes, seconds } = splitDuration(totalSeconds);
  if (minutes <= 0) return `${seconds}s`;
  if (seconds <= 0) return `${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

/** Returns the local date string (YYYY-MM-DD) resetting exactly at 12:00 AM midnight */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
