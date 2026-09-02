"use client";

import { useEffect } from "react";

export const FITOS_DATA_UPDATED_EVENT = "fitos:data-updated";

export type DataUpdateCategory =
  | "water"
  | "sleep"
  | "meal"
  | "weight"
  | "workout"
  | "measurement"
  | "profile"
  | "all";

/**
 * Dispatches a global event across the application so any mounted view
 * (like Dashboard, Diet, Progress) can instantly re-fetch without full page reload.
 */
export function notifyDataUpdated(category: DataUpdateCategory = "all") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(FITOS_DATA_UPDATED_EVENT, {
        detail: { category, timestamp: Date.now() },
      }),
    );
  }
}

/**
 * Custom React hook to listen for real-time background data updates.
 */
export function useDataUpdateListener(
  callback: (category?: DataUpdateCategory) => void,
) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        category?: DataUpdateCategory;
        timestamp: number;
      }>;
      callback(customEvent.detail?.category);
    };

    window.addEventListener(FITOS_DATA_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(FITOS_DATA_UPDATED_EVENT, handleUpdate);
    };
  }, [callback]);
}
