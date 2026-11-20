"use client";

import { useState } from "react";
import {
  Ruler,
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/shared/I18nProvider";
import { cn } from "@/lib/utils";
import type { IBodyMeasurement } from "@/types/fitness";

const MEASUREMENT_CONFIG: {
  key: keyof Omit<IBodyMeasurement, "_id" | "clerkId" | "date">;
  label: string;
  icon: string;
}[] = [
  { key: "chest", label: "profile.measure.chest", icon: "👕" },
  { key: "waist", label: "profile.measure.waist", icon: "👖" },
  { key: "hip", label: "profile.measure.hip", icon: "🦴" },
  { key: "shoulder", label: "profile.measure.shoulder", icon: "💪" },
  { key: "neck", label: "profile.measure.neck", icon: "🧣" },
  { key: "arm", label: "profile.measure.arm", icon: "💪" },
  { key: "forearm", label: "profile.measure.forearm", icon: "✊" },
  { key: "thigh", label: "profile.measure.thigh", icon: "🦵" },
  { key: "calf", label: "profile.measure.calf", icon: "🦶" },
];

function MeasurementChangeGroup({
  sincePrevious,
  sinceFirst,
}: {
  sincePrevious?: number;
  sinceFirst?: number;
}) {
  if (sincePrevious === undefined && sinceFirst === undefined) return null;
  return (
    <div className="flex flex-col items-end gap-0.5">
      {sincePrevious !== undefined && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded",
            sincePrevious < 0
              ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300"
              : sincePrevious > 0
                ? "text-blue-700 bg-blue-500/10 dark:text-blue-300"
                : "text-muted-foreground bg-muted/60",
          )}
        >
          <span className="opacity-70">prev:</span> {sincePrevious > 0 ? `+${sincePrevious}` : sincePrevious}
        </span>
      )}
      {sinceFirst !== undefined && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded",
            sinceFirst < 0
              ? "text-emerald-700 bg-emerald-500/15 dark:text-emerald-300 font-black"
              : sinceFirst > 0
                ? "text-purple-700 bg-purple-500/15 dark:text-purple-300 font-black"
                : "text-muted-foreground bg-muted/60",
          )}
        >
          <span className="opacity-70">start:</span> {sinceFirst > 0 ? `+${sinceFirst}` : sinceFirst}
        </span>
      )}
    </div>
  );
}

interface BodyMeasurementsTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  onOpenMeasurementModal: () => void;
}

export default function BodyMeasurementsTab({
  data,
  onOpenMeasurementModal,
}: BodyMeasurementsTabProps) {
  const { t, locale } = useI18n();
  const isBn = locale === "bn";
  const [protocolOpen, setProtocolOpen] = useState(false);

  const latest = data?.latestMeasurements;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="glass-card p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-border/50 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              {t("profile.measurements.title")}
            </h3>
            {latest?.date && (
              <Badge
                variant="secondary"
                className="text-[10px] rounded-full font-medium bg-muted"
              >
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(latest.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={onOpenMeasurementModal}
            className="rounded-xl text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-600/90 text-white ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            {t("profile.actions.update")}
          </Button>
        </div>

        {!latest ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20">
            <Ruler className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">
              {t("profile.measurements.empty")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {t("profile.measurements.emptyHint")}
            </p>
            <Button
              onClick={onOpenMeasurementModal}
              className="mt-4 rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-600/90 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("profile.actions.logFirst")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {MEASUREMENT_CONFIG.map(({ key, label, icon }) => {
                const val = latest?.[key];
                const changes = data?.measurementChanges?.[key];
                const isShoulder = key === "shoulder";
                return (
                  <div
                    key={key}
                    className="p-3 sm:p-3.5 rounded-2xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                          <span className="text-sm">{icon}</span>
                          {t(label)}
                        </p>
                        {isShoulder && (
                          <p className="text-[9px] text-muted-foreground/75 mt-0.5">
                            Circumference
                          </p>
                        )}
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-lg sm:text-xl font-black tracking-tight">
                            {val !== undefined && val !== null ? val : "--"}
                          </span>
                          {val !== undefined && val !== null && (
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              cm
                            </span>
                          )}
                        </div>
                      </div>
                      <MeasurementChangeGroup
                        sincePrevious={changes?.sincePrevious}
                        sinceFirst={changes?.sinceFirst}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Collapsible Standardized Measuring Protocol Guide (Declutters vertical space) */}
            <div className="rounded-2xl border border-border/40 bg-muted/30 overflow-hidden">
              <button
                type="button"
                onClick={() => setProtocolOpen(!protocolOpen)}
                className="w-full p-3 sm:p-3.5 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-foreground">
                    {isBn
                      ? "সঠিকভাবে পরিমাপ করার নির্দেশিকা (প্রটোকল)"
                      : "Standardized Body Measurement Protocol"}
                  </span>
                </div>
                {protocolOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>

              {protocolOpen && (
                <div className="p-3 sm:p-4 pt-0 border-t border-border/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
                  <div className="p-2.5 rounded-xl bg-background/60 border border-border/30">
                    <p className="font-bold text-foreground">📍 Waist at Navel</p>
                    <p className="text-[10px] mt-0.5 leading-normal">
                      Place tape horizontally across your navel/belly button, not high at ribcage.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-background/60 border border-border/30">
                    <p className="font-bold text-foreground">🌅 Morning Fasted</p>
                    <p className="text-[10px] mt-0.5 leading-normal">
                      Measure right after waking and bathroom, before food or water intake.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-background/60 border border-border/30">
                    <p className="font-bold text-foreground">🧘 Relaxed Abdomen</p>
                    <p className="text-[10px] mt-0.5 leading-normal">
                      Breathe normally. Do not suck in your stomach or flex while measuring.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-background/60 border border-border/30">
                    <p className="font-bold text-foreground">📏 Same Tape Tension</p>
                    <p className="text-[10px] mt-0.5 leading-normal">
                      Tape should be snug against skin without compressing soft tissue.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
