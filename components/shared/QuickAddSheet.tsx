"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  Droplet,
  Zap,
  Plus,
  Clock,
  Check,
  ScanBarcode,
} from "lucide-react";
import { getRecentFoods } from "@/lib/actions/recent-meals.actions";
import { addWater } from "@/lib/actions/water-sleep.actions";
import { appendMealItem } from "@/lib/actions/meal.actions";
import { getLocalDateString } from "@/lib/utils";
import { notifyDataUpdated } from "@/lib/events";
import type { IMealItem, MealType } from "@/types/fitness";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(
  () => import("@/components/shared/BarcodeScanner"),
  { ssr: false },
);

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleted?: () => void | Promise<void>;
}

export default function QuickAddSheet({
  open,
  onOpenChange,
  onCompleted,
}: QuickAddSheetProps) {
  const [recentFoods, setRecentFoods] = useState<IMealItem[]>([]);
  const [addingFoodIndex, setAddingFoodIndex] = useState<number | null>(null);
  const [loggedFoodNames, setLoggedFoodNames] = useState<Set<string>>(
    new Set(),
  );
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const router = useRouter();

  const todayStr = getLocalDateString();

  useEffect(() => {
    if (open) {
      getRecentFoods(8).then((foods) => setRecentFoods(foods));
    }
  }, [open]);

  // Determine current meal type based on time
  const currentHour = new Date().getHours();
  let defaultMealType: MealType = "lunch";
  if (currentHour >= 5 && currentHour < 11) defaultMealType = "breakfast";
  else if (currentHour >= 11 && currentHour < 16) defaultMealType = "lunch";
  else if (currentHour >= 16 && currentHour < 22) defaultMealType = "dinner";
  else defaultMealType = "snack";

  const handleQuickAddFood = async (item: IMealItem, index: number) => {
    try {
      setAddingFoodIndex(index);
      await appendMealItem(todayStr, defaultMealType, {
        foodId: item.foodId,
        name: item.name,
        serving: item.serving || "1 serving",
        quantity: 1,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber || 0,
      });
      setLoggedFoodNames((prev) => new Set(prev).add(item.name));
      toast.success(
        `Logged ${item.name} (${item.calories} kcal) to ${defaultMealType}! 🍲`,
      );
      notifyDataUpdated("meal");
      await onCompleted?.();
    } catch {
      toast.error("Failed to log food");
    } finally {
      setAddingFoodIndex(null);
    }
  };

  const handleQuickWater = async (amountMl: number) => {
    try {
      await addWater(amountMl, todayStr);
      toast.success(
        `Added ${amountMl >= 1000 ? `${amountMl / 1000}L` : `${amountMl}ml`} water! 💧`,
      );
      notifyDataUpdated("water");
      await onCompleted?.();
      onOpenChange(false);
    } catch {
      toast.error("Failed to log water");
    }
  };

  return (
    <>
      <BarcodeScanner
        open={barcodeOpen}
        onOpenChange={setBarcodeOpen}
        dateStr={todayStr}
        defaultMealType={defaultMealType}
        onLogged={async () => {
          notifyDataUpdated("meal");
          await onCompleted?.();
        }}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-3xl p-5 gap-4">
          <DialogHeader className="px-1">
            <DialogTitle className="text-lg font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary fill-primary" />
                Quick Add
              </span>
              <span className="text-xs text-muted-foreground font-medium capitalize bg-muted px-2.5 py-1 rounded-full">
                {defaultMealType} Time
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Section 1: One-Tap Recent Foods */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Recent Foods (One-Tap Log)
            </p>

            {recentFoods.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {recentFoods.map((food, idx) => {
                  const isDone = loggedFoodNames.has(food.name);
                  const isAdding = addingFoodIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-2xl bg-muted/40 border border-border/40 hover:bg-accent/60 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                          <UtensilsCrossed className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">
                            {food.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {food.calories} kcal &middot; P: {food.protein}g
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        disabled={isAdding}
                        onClick={() => handleQuickAddFood(food, idx)}
                        className={`rounded-xl text-xs h-8 px-3 font-bold ${
                          isDone
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-primary hover:bg-primary/90 text-white"
                        }`}
                      >
                        {isAdding ? (
                          "..."
                        ) : isDone ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Added
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Log
                          </span>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-border/60 text-center">
                <p className="text-xs text-muted-foreground">
                  No recent foods logged yet. Go to Diet to search foods!
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    router.push("/diet");
                  }}
                  className="text-xs text-primary font-bold p-0 mt-1"
                >
                  Open Food Search &rarr;
                </Button>
              </div>
            )}
          </div>

          {/* Section 2: Instant Hydration */}
          <div className="space-y-2 pt-2 border-t border-border/40">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 text-blue-500" />
              Instant Hydration
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "+250ml", ml: 250, desc: "Glass" },
                { label: "+500ml", ml: 500, desc: "Bottle" },
                { label: "+1000ml", ml: 1000, desc: "1L Jug" },
              ].map((w) => (
                <Button
                  key={w.ml}
                  variant="outline"
                  onClick={() => handleQuickWater(w.ml)}
                  className="rounded-2xl py-3 h-auto flex flex-col gap-0.5 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 text-blue-600 dark:text-blue-400"
                >
                  <span className="text-xs font-bold">{w.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {w.desc}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Section 3: Barcode shortcut */}
          <div className="pt-1">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setBarcodeOpen(true);
              }}
              className="w-full rounded-2xl gap-2 text-xs font-semibold border-border/60 py-5"
            >
              <ScanBarcode className="w-4 h-4 text-primary" />
              Scan Packaged Food Barcode
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
