"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Utensils, Sparkles } from "lucide-react";
import { getFoods } from "@/lib/actions/food.actions";
import type { IFood } from "@/types/fitness";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState<IFood[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) {
      setQuery("");
      setFoods([]);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setFoods([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await getFoods(query);
        setFoods(results);
      } catch {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl p-4 gap-3">
        <DialogHeader className="px-2 pt-2">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Instant Search Foods & Exercises
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Type a food (e.g. Polao, Kacchi, Chicken) or exercise..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 rounded-xl text-sm bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1.5 px-1 py-1">
          {loading && (
            <p className="text-xs text-muted-foreground text-center py-6">Searching database...</p>
          )}

          {!loading && query && foods.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No matching foods found. You can add custom foods in the Diet section!
            </p>
          )}

          {!query && (
            <div className="text-center py-6 text-xs text-muted-foreground space-y-1">
              <p>Quick search over 20+ Bangladeshi & global food items.</p>
              <p className="text-[11px] opacity-75">Try searching: <span className="font-semibold text-foreground">Rice, Kacchi, Dal, Chicken Curry, Oats</span></p>
            </div>
          )}

          {foods.map((food) => (
            <div
              key={food._id}
              onClick={() => {
                onOpenChange(false);
                router.push("/diet");
              }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/80 transition-colors cursor-pointer border border-border/40"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    {food.name}
                    {food.isBangladeshi && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-medium">
                        BD
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
  );
}
