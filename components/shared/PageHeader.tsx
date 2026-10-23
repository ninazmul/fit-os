"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Optional right-aligned actions (buttons, badges, links). */
  actions?: React.ReactNode;
  /** Optional content rendered directly below the title row (e.g. date navigation). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Compact, consistent page header used across the app.
 * Keeps titles at a predictable size so pages share one typographic rhythm.
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-black tracking-tight sm:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </div>

      {children}
    </header>
  );
}
