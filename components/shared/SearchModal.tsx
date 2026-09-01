"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Utensils, Sparkles, ScanBarcode } from "lucide-react";
import { getFoods } from "@/lib/actions/food.actions";
import type { IFood, FoodDisplayCategory } from "@/types/fitness";
import { foods as defaultFoods } from "@/public/foods";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const BarcodeScanner = dynamic(
  () => import("@/components/shared/BarcodeScanner"),
  { ssr: false }
);

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const displayCategories: { id: FoodDisplayCategory; label: string; emoji: string }[] = [
  { id: "all", label: "All Foods", emoji: "🌐" },
  { id: "home_cooking", label: "Home Cooking", emoji: "🏠" },
  { id: "street_food", label: "Street Food", emoji: "🛒" },
  { id: "drinks", label: "Drinks", emoji: "🥤" },
  { id: "fast_food", label: "Fast Food", emoji: "🍔" },
  { id: "traditional", label: "Traditional", emoji: "🎭" },
  { id: "fruits", label: "Fruits & Veg", emoji: "🍎" },
  { id: "restaurant", label: "Restaurant", emoji: "🍽️" },
];

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FoodDisplayCategory>("all");
  const [foods, setFoods] = useState<IFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveCategory("all");
      setFoods([]);
      return;
    }
    // Load default foods when opening
    setFoods(defaultFoods.slice(0, 30) as unknown as IFood[]);
  }, [open]);

  useEffect(() => {
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
  }, [query, activeCategory]);

  return (
    <>
      <BarcodeScanner open={barcodeOpen} onOpenChange={setBarcodeOpen} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] sm:max-w-lg rounded-3xl p-4 gap-3 max-h-[90vh] overflow-y-auto overflow-x-hidden no-scrollbar">
          <DialogHeader className="px-2 pt-2">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Categorized Bangladeshi Foods
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

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search (e.g. Polao, Kacchi, Fuchka, Borhani)..."
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
              <p className="text-xs text-muted-foreground text-center py-6">Searching database...</p>
            )}

            {!loading && foods.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                No matching foods found in this category. You can add custom foods in Diet!
              </p>
            )}

            {foods.map((food, idx) => (
              <div
                key={food._id || idx}
                onClick={() => {
                  onOpenChange(false);
                  router.push("/diet");
                }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-accent/80 transition-colors cursor-pointer border border-border/40"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      {food.name}
                      {food.isBangladeshi && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                          BD
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {food.servingSize} &middot; P: {food.protein}g &middot; C: {food.carbs}g &middot; F: {food.fat}g
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-primary">{food.calories}</span>
                  <span className="text-[10px] text-muted-foreground block">kcal</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

