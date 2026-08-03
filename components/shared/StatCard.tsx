"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "green" | "blue" | "orange" | "purple" | "pink";
  progress?: number; // 0-100
  trend?: string;
  trendType?: "up" | "down" | "neutral";
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  green: {
    border: "stat-card-green",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    progress: "bg-emerald-500",
  },
  blue: {
    border: "stat-card-blue",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    progress: "bg-blue-500",
  },
  orange: {
    border: "stat-card-orange",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    progress: "bg-amber-500",
  },
  purple: {
    border: "stat-card-purple",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    progress: "bg-purple-500",
  },
  pink: {
    border: "stat-card-pink",
    iconBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    progress: "bg-pink-500",
  },
};

export default function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  variant = "green",
  progress,
  trend,
  trendType = "neutral",
  className,
  onClick,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card p-4 rounded-2xl transition-all hover:shadow-md border border-border/50 relative overflow-hidden",
        styles.border,
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold tracking-tight">{value}</span>
            {unit && <span className="text-xs font-semibold text-muted-foreground">{unit}</span>}
          </div>
        </div>

        <div className={cn("p-2.5 rounded-xl flex items-center justify-center", styles.iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      )}

      {trend && (
        <div className="flex items-center gap-1 mt-2 text-xs font-medium">
          <span
            className={cn(
              trendType === "up" && "text-emerald-600 dark:text-emerald-400",
              trendType === "down" && "text-amber-600 dark:text-amber-400",
              trendType === "neutral" && "text-muted-foreground"
            )}
          >
            {trend}
          </span>
        </div>
      )}

      {progress !== undefined && (
        <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", styles.progress)}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
