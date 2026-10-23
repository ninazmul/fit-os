"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-2xl" />
          <div>
            <Skeleton className="h-6 w-44 rounded-lg" />
            <Skeleton className="mt-2 h-4 w-32 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-2xl" />
      </div>

      {/* Nutrition summary */}
      <Skeleton className="h-52 w-full rounded-3xl" />

      {/* Quick actions */}
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-11 rounded-2xl" />
        ))}
      </div>

      {/* Today's meals */}
      <Skeleton className="h-64 w-full rounded-3xl" />

      {/* Daily habits */}
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return <Skeleton className="h-32 w-full rounded-2xl" />;
}
