"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScanBarcode, Search, UtensilsCrossed, AlertCircle } from "lucide-react";
import type { IMealItem, MealType } from "@/types/fitness";
import { logMeal } from "@/lib/actions/meal.actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateStr?: string;
  defaultMealType?: MealType;
}

interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  image?: string;
}

export default function BarcodeScanner({
  open,
  onOpenChange,
  dateStr,
  defaultMealType = "snack",
}: BarcodeScannerProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const router = useRouter();

  const todayStr = dateStr || new Date().toISOString().split("T")[0];

  const handleLookupBarcode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setProduct(null);

      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${cleanCode}.json`
      );

      if (!res.ok) {
        throw new Error("Product not found");
      }

      const data = await res.json();

      if (data.status !== 1 || !data.product) {
        setErrorMsg(`No product found for barcode "${cleanCode}". Try searching manually.`);
        return;
      }

      const p = data.product;
      const nutriments = p.nutriments || {};

      const calories =
        Math.round(
          nutriments["energy-kcal_100g"] ||
            nutriments["energy-kcal_serving"] ||
            (nutriments["energy_100g"] ? nutriments["energy_100g"] / 4.184 : 0)
        ) || 0;

      const protein = Math.round((nutriments["proteins_100g"] || 0) * 10) / 10;
      const carbs = Math.round((nutriments["carbohydrates_100g"] || 0) * 10) / 10;
      const fat = Math.round((nutriments["fat_100g"] || 0) * 10) / 10;
      const fiber = Math.round((nutriments["fiber_100g"] || 0) * 10) / 10;

      setProduct({
        barcode: cleanCode,
        name: p.product_name || p.product_name_en || "Scanned Product",
        brand: p.brands || "",
        servingSize: p.serving_size || "100g",
        calories,
        protein,
        carbs,
        fat,
        fiber,
        image: p.image_front_small_url || p.image_url || "",
      });
    } catch {
      setErrorMsg("Error connecting to OpenFoodFacts barcode database.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogScannedProduct = async () => {
    if (!product) return;

    try {
      setLoading(true);
      const item: IMealItem = {
        name: product.brand ? `${product.brand} - ${product.name}` : product.name,
        serving: product.servingSize,
        quantity,
        calories: product.calories * quantity,
        protein: product.protein * quantity,
        carbs: product.carbs * quantity,
        fat: product.fat * quantity,
        fiber: product.fiber * quantity,
      };

      await logMeal({
        date: todayStr,
        mealType: defaultMealType,
        items: [item],
      });

      toast.success(`Logged ${item.name} (${item.calories} kcal)! 📦`);
      onOpenChange(false);
      setProduct(null);
      setBarcodeInput("");
      router.refresh();
    } catch {
      toast.error("Failed to log scanned food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-5 gap-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-primary" />
            Barcode Nutrition Scanner
          </DialogTitle>
        </DialogHeader>

        {/* Input Barcode */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Enter or Scan Barcode</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g. 8901030300001 (Milk, Biscuits, Juice...)"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLookupBarcode(barcodeInput);
              }}
              className="rounded-xl text-sm font-mono"
            />
            <Button
              disabled={loading || !barcodeInput.trim()}
              onClick={() => handleLookupBarcode(barcodeInput)}
              className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
            >
              {loading ? "..." : <Search className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Powered by OpenFoodFacts global food database. Try barcode numbers on milk, oats, biscuits, or protein powders.
          </p>
        </div>

        {/* Preset quick test barcodes */}
        <div className="space-y-1 pt-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Test Barcodes:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Oats", code: "3033710065067" },
              { label: "Nutella", code: "3017620422003" },
              { label: "Milk", code: "8712800000497" },
              { label: "KitKat", code: "5000159461122" },
            ].map((preset) => (
              <button
                key={preset.code}
                type="button"
                onClick={() => {
                  setBarcodeInput(preset.code);
                  handleLookupBarcode(preset.code);
                }}
                className="px-2.5 py-1 rounded-full bg-muted border border-border/50 text-[11px] font-medium hover:bg-accent transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Scanned product result card */}
        {product && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/20">
                  Found Product
                </span>
                <h4 className="text-base font-bold tracking-tight mt-1">{product.name}</h4>
                {product.brand && (
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                )}
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {product.calories * quantity}
                </span>
                <span className="text-[10px] text-muted-foreground block">kcal total</span>
              </div>
            </div>

            {/* Macros breakdown */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-emerald-500/20 text-center text-xs">
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">Serving</p>
                <p className="font-bold">{product.servingSize}</p>
              </div>
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">Protein</p>
                <p className="font-bold text-emerald-600">{product.protein * quantity}g</p>
              </div>
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">Carbs</p>
                <p className="font-bold text-blue-600">{product.carbs * quantity}g</p>
              </div>
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">Fat</p>
                <p className="font-bold text-purple-600">{product.fat * quantity}g</p>
              </div>
            </div>

            {/* Quantity control & Log button */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Servings:</Label>
                <div className="flex items-center gap-1">
                  {[0.5, 1, 2].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        quantity === q
                          ? "bg-emerald-600 text-white"
                          : "bg-background border border-border text-muted-foreground"
                      }`}
                    >
                      {q}x
                    </button>
                  ))}
                </div>
              </div>

              <Button
                disabled={loading}
                onClick={handleLogScannedProduct}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Log to {defaultMealType}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
