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
import type { IBodyMeasurement } from "@/types/fitness";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Ruler, Plus } from "lucide-react";

interface BodyMeasurementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: IBodyMeasurement | null;
}

interface MeasurementField {
  key: keyof Omit<IBodyMeasurement, "_id" | "clerkId" | "date">;
  label: string;
  placeholder: string;
  description: string;
}

const MEASUREMENT_FIELDS: MeasurementField[] = [
  {
    key: "chest",
    label: "Chest",
    placeholder: "e.g. 100",
    description: "Measure around the fullest part of your chest",
  },
  {
    key: "waist",
    label: "Waist",
    placeholder: "e.g. 80",
    description: "Measure around your natural waistline (belly button level)",
  },
  {
    key: "hip",
    label: "Hip",
    placeholder: "e.g. 95",
    description: "Measure around the widest part of your hips/buttocks",
  },
  {
    key: "shoulder",
    label: "Shoulders",
    placeholder: "e.g. 120",
    description: "Measure across the widest part of your shoulders (back)",
  },
  {
    key: "neck",
    label: "Neck",
    placeholder: "e.g. 38",
    description: "Measure around the base of your neck (below Adam's apple)",
  },
  {
    key: "arm",
    label: "Arm (Bicep)",
    placeholder: "e.g. 35",
    description: "Measure around the flexed bicep at its thickest point",
  },
  {
    key: "forearm",
    label: "Forearm",
    placeholder: "e.g. 28",
    description: "Measure around the thickest part of your forearm",
  },
  {
    key: "thigh",
    label: "Thigh",
    placeholder: "e.g. 58",
    description: "Measure around the thickest part of your thigh (flexed)",
  },
  {
    key: "calf",
    label: "Calf",
    placeholder: "e.g. 38",
    description: "Measure around the thickest part of your calf (flexed)",
  },
];

export default function BodyMeasurementModal({
  open,
  onOpenChange,
  initialData,
}: BodyMeasurementModalProps) {
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setDate(initialData.date || new Date().toISOString().split("T")[0]);
      const init: Record<string, string> = {};
      MEASUREMENT_FIELDS.forEach((f) => {
        const val = initialData[f.key];
        if (val !== undefined && val !== null) {
          init[f.key] = String(val);
        }
      });
      setMeasurements(init);
    } else {
      setDate(new Date().toISOString().split("T")[0]);
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
      toast.error("Please enter at least one measurement");
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
      toast.success("Body measurements saved successfully! 📏");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save measurements");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Ruler className="w-5 h-5 text-primary" />
            Log Body Measurements
          </DialogTitle>
          <DialogDescription className="text-xs">
            Track your body transformation over time. All measurements are in
            centimeters (cm).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Measurement Date</Label>
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
                    {field.label} (cm)
                  </Label>
                </div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={field.placeholder}
                  value={measurements[field.key] ?? ""}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="rounded-xl font-medium"
                />
                <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                  {field.description}
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
              Cancel
            </Button>
            <Button
              disabled={loading}
              onClick={handleSave}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {loading ? "Saving..." : "Save Measurements 📏"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
