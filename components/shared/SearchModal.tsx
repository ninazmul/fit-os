"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Utensils, Sparkles, ScanBarcode, Plus, Check } from "lucide-react";
import { getFoods } from "@/lib/actions/food.actions";
import { appendMealItem } from "@/lib/actions/meal.actions";
import { notifyDataUpdated } from "@/lib/events";
import { getLocalDateString } from "@/lib/utils";
import type { IFood, FoodDisplayCategory, MealType } from "@/types/fitness";
import { foods as defaultFoods } from "@/public/foods";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(
  () => import("@/components/shared/BarcodeScanner"),
  { ssr: false },
);

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMealSlot?: MealType;
  dateStr?: string;
  onCompleted?: () => void | Promise<void>;
}

const displayCategories: {
  id: FoodDisplayCategory;
  label: string;
  emoji: string;
}[] = [
  { id: "all", label: "All Foods", emoji: "🌐" },
  { id: "home_cooking", label: "Home Cooking", emoji: "🏠" },
  { id: "street_food", label: "Street Food", emoji: "🛒" },
  { id: "drinks", label: "Drinks", emoji: "🥤" },
  { id: "fast_food", label: "Fast Food", emoji: "🍔" },
  { id: "traditional", label: "Traditional", emoji: "🎭" },
  { id: "fruits", label: "Fruits & Veg", emoji: "🍎" },
  { id: "restaurant", label: "Restaurant", emoji: "🍽️" },
];

export default function SearchModal({
  open,
  onOpenChange,
  defaultMealSlot,
  dateStr,
  onCompleted,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<FoodDisplayCategory>("all");
  const [foods, setFoods] = useState<IFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [mealSlot, setMealSlot] = useState<MealType>(
    defaultMealSlot || "lunch",
  );
  const [addingId, setAddingId] = useState<string | null>(null);
  const [loggedIds, setLoggedIds] = useState<Set<string>>(new Set());

  const activeDate = dateStr || getLocalDateString();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveCategory("all");
      setFoods([]);
      return;
    }
    // Determine default meal slot
    if (defaultMealSlot) {
      setMealSlot(defaultMealSlot);
    } else {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) setMealSlot("breakfast");
      else if (hour >= 11 && hour < 16) setMealSlot("lunch");
      else if (hour >= 16 && hour < 22) setMealSlot("dinner");
      else setMealSlot("snack");
    }
    // Load default foods when opening
    setFoods(defaultFoods.slice(0, 30) as unknown as IFood[]);
  }, [open, defaultMealSlot]);

  useEffect(() => {
    if (!open) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (!query.trim() && activeCategory === "all") {
          setFoods(defaultFoods.slice(0, 30) as unknown as IFood[]);
        } else {
          const results = await getFoods(query, activeCategory);
          setFoods(results);
        }
      } catch {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 250);
    return () => clearTimeout(timer);
  }, [query, activeCategory, open]);

  const handleQuickLog = async (food: IFood, foodKey: string) => {
    try {
      setAddingId(foodKey);
      await appendMealItem(activeDate, mealSlot, {
        foodId: food._id || foodKey,
        name: food.name,
        serving: food.servingSize || "1 serving",
        quantity: 1,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber || 0,
      });

      setLoggedIds((prev) => new Set(prev).add(foodKey));
      toast.success(
        `Logged ${food.name} (${food.calories} kcal) to ${mealSlot}! 🍲`,
      );
      notifyDataUpdated("meal");
      await onCompleted?.();
    } catch {
      toast.error("Failed to log food");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <BarcodeScanner
        open={barcodeOpen}
        onOpenChange={setBarcodeOpen}
        dateStr={activeDate}
        defaultMealType={mealSlot}
        onLogged={async () => {
          notifyDataUpdated("meal");
          await onCompleted?.();
        }}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-xl rounded-3xl p-4 sm:p-5 gap-3 max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar">
          <DialogHeader className="px-1 pt-1">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Bangladeshi & Global Foods
              </span>
              <button
                type="button"
                onClick={() => setBarcodeOpen(true)}
                className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
              >
                <ScanBarcode className="w-3.5 h-3.5" /> Barcode
              </button>
            </DialogTitle>
          </DialogHeader>

          {/* Meal Slot Selector */}
          <div className="flex items-center justify-between gap-2 p-1 bg-muted/60 rounded-2xl text-xs font-semibold">
            {(
              [
                { id: "breakfast", label: "Breakfast" },
                { id: "lunch", label: "Lunch" },
                { id: "dinner", label: "Dinner" },
                { id: "snack", label: "Snack" },
              ] as const
            ).map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => setMealSlot(slot.id)}
                className={`flex-1 py-1.5 rounded-xl transition-all capitalize text-center ${
                  mealSlot === slot.id
                    ? "bg-primary text-white shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search (e.g. Polao, Kacchi, Fuchka, Borhani, Eggs)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 rounded-2xl text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
              autoFocus
            />
          </div>

          {/* Category Pills Slider */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {displayCategories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-primary text-white shadow-sm font-bold"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Food List */}
          <div className="max-h-80 overflow-y-auto space-y-1.5 px-1 py-1">
            {loading && (
              <p className="text-xs text-muted-foreground text-center py-6">
                Searching database...
              </p>
            )}

            {!loading && foods.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                No matching foods found in this category.
              </p>
            )}

            {foods.map((food, idx) => {
              const foodKey = food._id || `${food.name}_${idx}`;
              const isDone = loggedIds.has(foodKey);
              const isAdding = addingId === foodKey;

              return (
                <div
                  key={foodKey}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent/70 transition-all border border-border/40 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold flex items-center gap-1.5 truncate">
                        <span className="truncate">{food.name}</span>
                        {food.isBangladeshi && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                            BD
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {food.servingSize} &middot; P: {food.protein}g &middot;
                        C: {food.carbs}g &middot; F: {food.fat}g
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary">
                        {food.calories}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        kcal
                      </span>
                    </div>

                    <Button
                      size="sm"
                      disabled={isAdding}
                      onClick={() => handleQuickLog(food, foodKey)}
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
                          <Check className="w-3.5 h-3.5" /> Logged
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Plus className="w-3.5 h-3.5" /> Log
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
