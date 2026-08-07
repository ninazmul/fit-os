"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={`glass-card rounded-3xl p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto my-4 border border-dashed border-border/70 ${className || ""}`}>
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">{description}</p>
      
      <div className="flex items-center gap-2 mt-5">
        {actionText && onAction && (
          <Button onClick={onAction} className="rounded-xl font-bold text-xs">
            {actionText}
          </Button>
        )}

        {secondaryActionText && onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction} className="rounded-xl text-xs font-semibold border-border/60">
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
}

