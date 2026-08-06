"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UtensilsCrossed,
  Scale,
  Droplet,
  Dumbbell,
  Moon,
  Star,
} from "lucide-react";
import { addWater, addSleepSession } from "@/lib/actions/water-sleep.actions";
import { formatTime12h } from "@/lib/utils";
import { logWeight } from "@/lib/actions/weight.actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface QuickActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAction?: "meal" | "weight" | "water" | "workout" | "sleep";
  onCompleted?: () => void | Promise<void>;
}

export default function QuickActionModal({
  open,
  onOpenChange,
  defaultAction = "water",
  onCompleted,
}: QuickActionModalProps) {
  const [activeTab, setActiveTab] = useState<
    "meal" | "weight" | "water" | "workout" | "sleep"
  >(defaultAction);
  const [waterAmount, setWaterAmount] = useState<number>(250);
  const [weightVal, setWeightVal] = useState<string>("");
  const [weightNotes, setWeightNotes] = useState<string>("");
  const [sleepTime, setSleepTime] = useState<string>("23:00");
  const [wakeTime, setWakeTime] = useState<string>("07:00");
  const [sleepQuality, setSleepQuality] = useState<number>(4);
  const [sleepNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setActiveTab(defaultAction);
    }
  }, [defaultAction, open]);

  const handleLogWater = async (amount: number) => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      await addWater(amount, today);
      toast.success(`Logged ${amount}ml of water! 💧`);
      onOpenChange(false);
      await onCompleted?.();
      router.refresh();
    } catch {
      toast.error("Failed to log water");
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightVal || isNaN(Number(weightVal))) {
      toast.error("Please enter a valid weight");
      return;
    }

    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      await logWeight({
        date: today,
        weight: Number(weightVal),
        notes: weightNotes,
      });
      toast.success(`Logged ${weightVal} kg! ⚖️`);
      onOpenChange(false);
      setWeightVal("");
      setWeightNotes("");
      await onCompleted?.();
      router.refresh();
    } catch {
      toast.error("Failed to log weight");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quick Log</DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-muted rounded-xl mb-4">
          <button
            type="button"
            onClick={() => setActiveTab("water")}
            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "water"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Droplet className="w-4 h-4 mb-0.5 text-blue-500" />
            Water
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sleep")}
            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "sleep"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="w-4 h-4 mb-0.5 text-indigo-500" />
            Sleep
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("weight")}
            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === "weight"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scale className="w-4 h-4 mb-0.5 text-purple-500" />
            Weight
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              router.push("/diet");
            }}
            className="flex flex-col items-center py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <UtensilsCrossed className="w-4 h-4 mb-0.5 text-emerald-500" />
            Meal
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              router.push("/workout");
            }}
            className="flex flex-col items-center py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <Dumbbell className="w-4 h-4 mb-0.5 text-amber-500" />
            Workout
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === "water" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              Quickly add water to today&apos;s progress ring:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[250, 500, 750, 1000].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleLogWater(amt)}
                  className="rounded-xl py-6 flex flex-col gap-1 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40"
                >
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                    +{amt >= 1000 ? `${amt / 1000}L` : `${amt}ml`}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {amt === 250
                      ? "Glass"
                      : amt === 500
                        ? "Small Bottle"
                        : amt === 750
                          ? "Sports Bottle"
                          : "Large Bottle"}
                  </span>
                </Button>
              ))}
            </div>

            <div className="flex gap-2 items-end pt-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="custom-water" className="text-xs">
                  Custom Water (ml)
                </Label>
                <Input
                  id="custom-water"
                  type="number"
                  placeholder="e.g. 350"
                  value={waterAmount}
                  onChange={(e) => setWaterAmount(Number(e.target.value))}
                  className="rounded-xl"
                />
              </div>
              <Button
                disabled={loading || !waterAmount}
                onClick={() => handleLogWater(waterAmount)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add
              </Button>
            </div>
          </div>
        )}

        {activeTab === "sleep" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground text-center">
              Quick presets for last night&apos;s sleep duration:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[
                { hours: 6, sleep: "23:00", wake: "05:00", label: "6 hrs" },
                { hours: 7, sleep: "23:00", wake: "06:00", label: "7 hrs" },
                { hours: 7.5, sleep: "23:00", wake: "06:30", label: "7.5 hrs" },
                { hours: 8, sleep: "23:00", wake: "07:00", label: "8 hrs" },
              ].map((p) => (
                <Button
                  key={p.hours}
                  variant="outline"
                  disabled={loading}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const today = new Date().toISOString().split("T")[0];
                      await addSleepSession({
                        date: today,
                        sleepTime: p.sleep,
                        wakeTime: p.wake,
                        totalHours: p.hours,
                        quality: sleepQuality,
                        notes: sleepNotes,
                      });
                      toast.success(`Logged ${p.hours}h sleep! 🌙`);
                      onOpenChange(false);
                      await onCompleted?.();
                      router.refresh();
                    } catch {
                      toast.error("Failed to log sleep");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="rounded-xl py-4 flex flex-col gap-0.5 border-indigo-500/20 hover:bg-indigo-500/10 hover:border-indigo-500/40"
                >
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {p.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {formatTime12h(p.sleep)} - {formatTime12h(p.wake)}
                  </span>
                </Button>
              ))}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setLoading(true);
                  const today = new Date().toISOString().split("T")[0];
                  let hrs = 8;
                  try {
                    const [h1, m1] = sleepTime.split(":").map(Number);
                    const [h2, m2] = wakeTime.split(":").map(Number);
                    let mins = h2 * 60 + m2 - (h1 * 60 + m1);
                    if (mins <= 0) mins += 24 * 60;
                    hrs = Math.round((mins / 60) * 10) / 10;
                  } catch {
                    hrs = 8;
                  }
                  await addSleepSession({
                    date: today,
                    sleepTime,
                    wakeTime,
                    totalHours: hrs,
                    quality: sleepQuality,
                    notes: sleepNotes,
                  });
                  toast.success(`Logged ${hrs}h sleep session! 🌙`);
                  onOpenChange(false);
                  await onCompleted?.();
                  router.refresh();
                } catch {
                  toast.error("Failed to save sleep");
                } finally {
                  setLoading(false);
                }
              }}
              className="space-y-3 pt-2 border-t border-border/30"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sleep-time" className="text-xs">
                    Sleep Time
                  </Label>
                  <Input
                    id="sleep-time"
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="wake-time" className="text-xs">
                    Wake Time
                  </Label>
                  <Input
                    id="wake-time"
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Sleep Quality</Label>
                <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-muted/50 border border-border/30">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSleepQuality(star)}
                      className={`p-1.5 rounded-lg transition-transform hover:scale-110 ${
                        sleepQuality >= star
                          ? "text-amber-500 fill-amber-500"
                          : "text-muted-foreground/30"
                      }`}
                    >
                      <Star
                        className={`w-5 h-5 ${sleepQuality >= star ? "fill-amber-400" : ""}`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-muted-foreground ml-2 min-w-[50px] text-right">
                    {sleepQuality}/5 ★
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {loading ? "Saving..." : "Save Custom Sleep Session"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "weight" && (
          <form onSubmit={handleLogWeight} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="weight-val" className="text-xs">
                Today&apos;s Weight (kg)
              </Label>
              <Input
                id="weight-val"
                type="number"
                step="0.1"
                placeholder="e.g. 72.5"
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
                required
                className="rounded-xl text-lg font-bold"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="weight-notes" className="text-xs">
                Notes (optional)
              </Label>
              <Input
                id="weight-notes"
                placeholder="e.g. Morning empty stomach"
                value={weightNotes}
                onChange={(e) => setWeightNotes(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? "Saving..." : "Log Weight"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
