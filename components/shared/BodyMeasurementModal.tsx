"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logBodyMeasurement } from "@/lib/actions/body-measurement.actions";
import { getLocalDateString } from "@/lib/utils";
import type { IBodyMeasurement } from "@/types/fitness";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Ruler, Plus } from "lucide-react";
import { useI18n } from "@/components/shared/I18nProvider";

interface BodyMeasurementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IBodyMeasurement | null;
  onSuccess?: () => void;
}

interface MeasurementField {
  key: keyof Omit<IBodyMeasurement, "_id" | "clerkId" | "date">;
  labelKey: string;
  descriptionKey: string;
}

const MEASUREMENT_FIELDS: MeasurementField[] = [
  {
    key: "chest",
    labelKey: "shared.measurement.chest",
    descriptionKey: "shared.measurement.chestHelp",
  },
  {
    key: "waist",
    labelKey: "shared.measurement.waist",
    descriptionKey: "shared.measurement.waistHelp",
  },
  {
    key: "hip",
    labelKey: "shared.measurement.hip",
    descriptionKey: "shared.measurement.hipHelp",
  },
  {
    key: "shoulder",
    labelKey: "shared.measurement.shoulder",
    descriptionKey: "shared.measurement.shoulderHelp",
  },
  {
    key: "neck",
    labelKey: "shared.measurement.neck",
    descriptionKey: "shared.measurement.neckHelp",
  },
  {
    key: "arm",
    labelKey: "shared.measurement.arm",
    descriptionKey: "shared.measurement.armHelp",
  },
  {
    key: "forearm",
    labelKey: "shared.measurement.forearm",
    descriptionKey: "shared.measurement.forearmHelp",
  },
  {
    key: "thigh",
    labelKey: "shared.measurement.thigh",
    descriptionKey: "shared.measurement.thighHelp",
  },
  {
    key: "calf",
    labelKey: "shared.measurement.calf",
    descriptionKey: "shared.measurement.calfHelp",
  },
];

export default function BodyMeasurementModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: BodyMeasurementModalProps) {
  const [date, setDate] = useState(getLocalDateString());
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    // Always default date to today so new logs/updates record with current date
    setDate(getLocalDateString());
    if (initialData) {
      const init: Record<string, string> = {};
      MEASUREMENT_FIELDS.forEach((f) => {
        const val = initialData[f.key];
        if (val !== undefined && val !== null) {
          init[f.key] = String(val);
        }
      });
      setMeasurements(init);
    } else {
      setMeasurements({});
    }
  }, [open, initialData]);

  const handleChange = (key: string, value: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    const hasValues = Object.values(measurements).some(
      (v) => v !== "" && v !== undefined && v !== null
    );
    if (!hasValues) {
      toast.error(t("shared.measurement.emptyError"));
      return;
    }

    try {
      setLoading(true);
      const payload: Record<string, string | number> = { date };
      MEASUREMENT_FIELDS.forEach((f) => {
        const v = measurements[f.key];
        if (v !== "" && v !== undefined && v !== null) {
          const num = Number(v);
          if (!Number.isNaN(num) && num >= 0) {
            payload[f.key] = num;
          }
        }
      });

      await logBodyMeasurement(payload as never);
      toast.success(t("shared.measurement.saved"));
      onSuccess?.();
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(t("shared.measurement.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  const isToday = date === getLocalDateString();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl rounded-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            {t("shared.measurement.title")}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t("shared.measurement.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5 p-3 rounded-2xl bg-muted/20 border border-border/40">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                {t("shared.measurement.date")}
              </Label>
              <div className="flex items-center gap-2">
                {initialData?.date && (
                  <span className="text-[10px] text-muted-foreground">
                    {t("shared.measurement.previous", {
                      date: initialData.date,
                    })}
                  </span>
                )}
                {!isToday && (
                  <button
                    type="button"
                    onClick={() => setDate(getLocalDateString())}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    {t("shared.measurement.setToday")}
                  </button>
                )}
              </div>
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MEASUREMENT_FIELDS.map((field) => (
              <div
                key={field.key}
                className="space-y-1 p-3 rounded-xl bg-muted/30 border border-border/30"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <Plus className="w-3 h-3 text-primary" />
                    {t(field.labelKey)} (cm)
                  </Label>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={t("shared.measurement.numberPlaceholder")}
                  value={measurements[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="rounded-xl font-medium"
                />
                <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                  {t(field.descriptionKey)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-border"
            >
              {t("common.cancel")}
            </Button>
            <Button
              disabled={loading}
              onClick={handleSave}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {loading
                ? t("shared.saving")
                : t("shared.measurement.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
