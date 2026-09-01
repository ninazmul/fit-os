"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getMealLogsForDate,
  logMeal,
  deleteMealLog,
  removeMealItem,
} from "@/lib/actions/meal.actions";
import {
  getFoods,
  createCustomFood,
  updateCustomFood,
  deleteCustomFood,
} from "@/lib/actions/food.actions";
import { getUserProfile } from "@/lib/actions/profile.actions";
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
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Pencil,
  Search,
  Flame,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Apple,
  Bookmark,
  ScanBarcode,
  Sparkles,
  Scale,
  ChefHat,
  Info,
  CheckCircle2,
  Calculator,
} from "lucide-react";
import type {
  MealType,
  IFood,
  IMealItem,
  FoodCategory,
  SavedMealCategory,
  ISavedMeal,
} from "@/types/fitness";
import {
  estimateFoodNutritionWithAI,
  type DetectedIngredient,
  type AIEstimateResult,
} from "@/lib/actions/ai-food.actions";
import {
  extractGramsFromServing,
  calculateNutritionByGrams,
  calculateNutritionByMultiplier,
} from "@/lib/food-portion";
import {
  getSavedMeals,
  createSavedMeal,
  logSavedMeal,
  deleteSavedMeal,
} from "@/lib/actions/saved-meal.actions";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { format, addDays, subDays } from "date-fns";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});
const BarcodeScanner = dynamic(
  () => import("@/components/shared/BarcodeScanner"),
  { ssr: false },
);

const mealTypes: { type: MealType; label: string; icon: typeof Sun }[] = [
  { type: "breakfast", label: "Breakfast", icon: Sun },
  { type: "lunch", label: "Lunch", icon: UtensilsCrossed },
  { type: "dinner", label: "Dinner", icon: Moon },
  { type: "snack", label: "Snacks", icon: Apple },
];

export default function DietPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [meals, setMeals] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [savedMeals, setSavedMeals] = useState<ISavedMeal[]>([]);
  const [, setLoading] = useState(true);

  // Barcode modal state
  const [barcodeOpen, setBarcodeOpen] = useState(false);

  // Save template modal state
  const [saveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] =
    useState<SavedMealCategory>("breakfast");
  const [itemsToSave, setItemsToSave] = useState<IMealItem[]>([]);

  // Add meal modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>("breakfast");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory] = useState<string>("all");
  const [foodCatalog, setFoodCatalog] = useState<IFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<IFood | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityMode, setQuantityMode] = useState<"multiplier" | "grams">("multiplier");
  const [eatenGrams, setEatenGrams] = useState<number>(100);

  // Custom food modal state
  const [customFoodModalOpen, setCustomFoodModalOpen] = useState(false);
  const [customTab, setCustomTab] = useState<"ai" | "manual">("ai");
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<FoodCategory>("custom");
  const [customServing, setCustomServing] = useState("100g");
  const [customCalories, setCustomCalories] = useState<number>(200);
  const [customProtein, setCustomProtein] = useState<number>(10);
  const [customCarbs, setCustomCarbs] = useState<number>(30);
  const [customFat, setCustomFat] = useState<number>(5);
  const [customFiber, setCustomFiber] = useState<number>(2);

  // AI custom food estimation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiCookingMethod, setAiCookingMethod] = useState("pan_fry");
  const [aiTotalBatch, setAiTotalBatch] = useState("Total cooked: 1 batch (approx 4 portions)");
  const [aiPortionEaten, setAiPortionEaten] = useState("I ate: 1 portion (25%)");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIEstimateResult | null>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [mealsData, userProfile, templates] = await Promise.all([
        getMealLogsForDate(dateStr),
        getUserProfile(),
        getSavedMeals(),
      ]);
      setMeals(mealsData);
      setProfile(userProfile);
      setSavedMeals(templates);
    } catch (err) {
      console.error("Error fetching diet data:", err);
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load foods catalog when search query or category changes
  useEffect(() => {
    if (!addModalOpen) return;
    const fetchCatalog = async () => {
      try {
        const foods = await getFoods(searchQuery, selectedCategory);
        setFoodCatalog(foods);
      } catch (err) {
        console.error("Error loading foods:", err);
      }
    };
    fetchCatalog();
  }, [addModalOpen, searchQuery, selectedCategory]);

  // When food is selected, initialize portion grams
  const handleSelectFood = (food: IFood) => {
    setSelectedFood(food);
    const { grams } = extractGramsFromServing(food.servingSize);
    setEatenGrams(grams || 100);
    setQuantity(1);
  };

  // Compute active portion breakdown for currently selected food
  const currentPortionBreakdown = selectedFood
    ? quantityMode === "grams"
      ? calculateNutritionByGrams({
        baseServingSize: selectedFood.servingSize,
        baseCalories: selectedFood.calories,
        baseProtein: selectedFood.protein,
        baseCarbs: selectedFood.carbs,
        baseFat: selectedFood.fat,
        baseFiber: selectedFood.fiber || 0,
        eatenGrams: eatenGrams,
      })
      : calculateNutritionByMultiplier({
        baseServingSize: selectedFood.servingSize,
        baseCalories: selectedFood.calories,
        baseProtein: selectedFood.protein,
        baseCarbs: selectedFood.carbs,
        baseFat: selectedFood.fat,
        baseFiber: selectedFood.fiber || 0,
        quantity: quantity,
      })
    : null;

  const handleAddFoodToMeal = async () => {
    if (!selectedFood || !currentPortionBreakdown) {
      toast.error("Please select a food item");
      return;
    }

    try {
      const finalQuantity = currentPortionBreakdown.calculatedQuantity;

      const newItem: IMealItem = {
        foodId: selectedFood._id,
        name: selectedFood.name,
        serving:
          quantityMode === "grams"
            ? `${eatenGrams}g (of ${selectedFood.servingSize})`
            : selectedFood.servingSize,
        quantity: finalQuantity,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber || 0,
      };

      // Check if meal of this type already exists today
      const existingMeal = meals.find((m) => m.mealType === activeMealType);
      const existingItems = existingMeal ? existingMeal.items : [];
      const updatedItems = [...existingItems, newItem];

      await logMeal({
        date: dateStr,
        mealType: activeMealType,
        items: updatedItems,
      });

      toast.success(
        `Added ${selectedFood.name} (${Math.round(selectedFood.calories * finalQuantity)} kcal) to ${activeMealType}! 🥗`,
      );
      setAddModalOpen(false);
      setSelectedFood(null);
      setQuantity(1);
      setQuantityMode("multiplier");
      fetchData();
    } catch {
      toast.error("Failed to add meal");
    }
  };

  const resetCustomFoodForm = () => {
    setEditingFoodId(null);
    setCustomName("");
    setCustomCategory("custom");
    setCustomServing("100g");
    setCustomCalories(200);
    setCustomProtein(10);
    setCustomCarbs(30);
    setCustomFat(5);
    setCustomFiber(2);
    setAiPrompt("");
    setAiResult(null);
    setCustomTab("ai");
  };

  const handleOpenCreateCustomFood = () => {
    resetCustomFoodForm();
    setCustomFoodModalOpen(true);
  };

  const handleEditCustomFood = (e: React.MouseEvent, food: IFood) => {
    e.stopPropagation();
    if (!food._id) return;
    setEditingFoodId(food._id);
    setCustomName(food.name);
    setCustomCategory(food.category || "custom");
    setCustomServing(food.servingSize);
    setCustomCalories(food.calories);
    setCustomProtein(food.protein);
    setCustomCarbs(food.carbs);
    setCustomFat(food.fat);
    setCustomFiber(food.fiber || 0);
    setCustomTab("manual");
    setCustomFoodModalOpen(true);
  };

  const handleDeleteCustomFood = async (
    e: React.MouseEvent,
    foodId: string,
  ) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this custom food?")) return;
    try {
      await deleteCustomFood(foodId);
      toast.success("Custom food deleted!");
      if (selectedFood?._id === foodId) {
        setSelectedFood(null);
      }
      const foods = await getFoods(searchQuery, selectedCategory);
      setFoodCatalog(foods);
    } catch {
      toast.error("Failed to delete custom food");
    }
  };

  const handleRunAIEstimate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please describe what ingredients you cooked and portion eaten.");
      return;
    }

    try {
      setAiLoading(true);
      const result = await estimateFoodNutritionWithAI({
        description: aiPrompt,
        cookingMethod: aiCookingMethod,
        cookedPortionTotal: aiTotalBatch,
        portionEaten: aiPortionEaten,
      });

      setAiResult(result);
      setCustomName(result.name);
      setCustomCategory(result.category);
      setCustomServing(result.servingSize);
      setCustomCalories(result.calories);
      setCustomProtein(result.protein);
      setCustomCarbs(result.carbs);
      setCustomFat(result.fat);
      setCustomFiber(result.fiber);

      toast.success("AI calculated nutritional values! Review and save ✨");
    } catch (err) {
      console.error("AI estimation error:", err);
      toast.error("Failed to calculate with AI. Please check inputs.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveCustomFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: customName,
        category: customCategory,
        servingSize: customServing,
        calories: customCalories,
        protein: customProtein,
        carbs: customCarbs,
        fat: customFat,
        fiber: customFiber,
      };

      if (editingFoodId) {
        await updateCustomFood(editingFoodId, payload);
        toast.success("Custom food updated!");
      } else {
        await createCustomFood(payload);
        toast.success("Custom food created!");
      }

      setCustomFoodModalOpen(false);
      resetCustomFoodForm();
      // Reload catalog
      const foods = await getFoods(searchQuery, selectedCategory);
      setFoodCatalog(foods);
    } catch {
      toast.error(
        editingFoodId ? "Failed to update food" : "Failed to create food",
      );
    }
  };

  const handleLogSavedTemplate = async (
    templateId: string,
    mealType: MealType,
  ) => {
    try {
      await logSavedMeal(templateId, dateStr, mealType);
      toast.success(`Logged saved meal template to ${mealType}! ⚡`);
      fetchData();
    } catch {
      toast.error("Failed to log saved meal template");
    }
  };

  const handleOpenSaveTemplateModal = (
    items: IMealItem[],
    mealType: MealType,
  ) => {
    setItemsToSave(items);
    setTemplateName(`${mealType.toUpperCase()} Template`);
    setTemplateCategory(mealType as SavedMealCategory);
    setSaveTemplateModalOpen(true);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || itemsToSave.length === 0) return;

    try {
      await createSavedMeal({
        name: templateName,
        category: templateCategory,
        items: itemsToSave,
      });
      toast.success(`Saved template "${templateName}"! 🔖`);
      setSaveTemplateModalOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to save meal template");
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteSavedMeal(id);
      toast.success("Saved meal template removed");
      fetchData();
    } catch {
      toast.error("Failed to remove template");
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMealLog(mealId);
      toast.success("Meal cleared");
      fetchData();
    } catch {
      toast.error("Failed to delete meal");
    }
  };

  const handleRemoveItem = async (mealId: string, itemIndex: number) => {
    try {
      await removeMealItem(mealId, itemIndex);
      toast.success("Item removed");
      fetchData();
    } catch {
      toast.error("Failed to remove item");
    }
  };

  // Daily nutrition aggregates
  const dailyCalories = meals.reduce((s, m) => s + m.totalCalories, 0);
  const dailyProtein = meals.reduce((s, m) => s + m.totalProtein, 0);
  const dailyCarbs = meals.reduce((s, m) => s + m.totalCarbs, 0);
  const dailyFat = meals.reduce((s, m) => s + m.totalFat, 0);
  const dailyFiber = meals.reduce((s, m) => s + m.totalFiber, 0);

  const calGoal = profile?.dailyCaloriesGoal || 2000;
  const proteinGoal = profile?.dailyProteinGoal || 150;
  const carbGoal = profile?.dailyCarbGoal || 200;
  const fatGoal = profile?.dailyFatGoal || 60;
  const fiberGoal = profile?.dailyFiberGoal || 30;

  return (
    <div className="space-y-6">
      <BarcodeScanner
        open={barcodeOpen}
        onOpenChange={setBarcodeOpen}
        dateStr={dateStr}
        onLogged={fetchData}
      />

      {/* Date Navigation & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Diet & Nutrition Tracker 🥗
          </h1>
          <p className="text-xs text-muted-foreground">
            Log meals, Bangladeshi dishes, saved templates & barcodes
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Selector Pill */}
          <div className="flex items-center gap-2 bg-card border border-border/60 p-1.5 rounded-2xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate((d) => subDays(d, 1))}
              className="h-8 w-8 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 text-xs font-semibold">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{format(selectedDate, "EEE, MMM d, yyyy")}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate((d) => addDays(d, 1))}
              className="h-8 w-8 rounded-xl"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Saved Meals & Templates Carousel (⭐⭐⭐⭐⭐ Phase 1) */}
      {savedMeals.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-primary" />
              Saved Meal Templates ({savedMeals.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Tap to log to {format(selectedDate, "MMM d")}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {savedMeals.map((template) => (
              <div
                key={template._id}
                className="glass-card p-3 rounded-2xl border border-border/50 shrink-0 w-52 space-y-2 hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {template.category.replace("_", " ")}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        template._id && handleDeleteTemplate(template._id)
                      }
                      className="text-muted-foreground hover:text-red-500 p-0.5"
                      title="Delete template"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold truncate mt-1.5">
                    {template.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {template.items?.map((i) => i.name).join(", ")}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] font-semibold mt-1">
                    <span className="text-primary">
                      {template.totalCalories} kcal
                    </span>
                    <span>&middot;</span>
                    <span className="text-emerald-600">
                      P: {template.totalProtein}g
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1 pt-1">
                  <Button
                    size="sm"
                    onClick={() =>
                      template._id &&
                      handleLogSavedTemplate(template._id, "breakfast")
                    }
                    className="h-7 text-[10px] rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
                  >
                    + Breakfast
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      template._id &&
                      handleLogSavedTemplate(template._id, "lunch")
                    }
                    className="h-7 text-[10px] rounded-xl font-semibold"
                  >
                    + Lunch
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Nutrition Summary Banner */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Consumed
              </p>
              <h2 className="text-2xl font-bold">
                {Math.round(dailyCalories)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / {calGoal} kcal
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold ml-auto">
            <div className="text-right">
              <p className="text-muted-foreground">Remaining</p>
              <p
                className={`text-base font-bold ${calGoal - dailyCalories < 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                {Math.max(0, calGoal - dailyCalories)} kcal
              </p>
            </div>
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Protein
              </span>
              <span className="text-muted-foreground">
                {Math.round(dailyProtein)}g / {proteinGoal}g
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (dailyProtein / proteinGoal) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                Carbs
              </span>
              <span className="text-muted-foreground">
                {Math.round(dailyCarbs)}g / {carbGoal}g
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (dailyCarbs / carbGoal) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                Fat
              </span>
              <span className="text-muted-foreground">
                {Math.round(dailyFat)}g / {fatGoal}g
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (dailyFat / fatGoal) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                Fiber
              </span>
              <span className="text-muted-foreground">
                {Math.round(dailyFiber)}g / {fiberGoal}g
              </span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{
                  width: `${Math.min(100, (dailyFiber / fiberGoal) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mid-page Ad */}
      <AdUnit size="auto" label="Sponsored" maxWidth="970px" />

      {/* Meal Types Sections */}
      <div className="space-y-4">
        {/* Barcode Scanner Button */}
        <Button
          variant="outline"
          onClick={() => setBarcodeOpen(true)}
          className="w-full rounded-2xl border-dashed border-2 border-primary/30 hover:bg-primary/5 text-primary font-bold gap-2"
        >
          <ScanBarcode className="w-4 h-4" />
          Scan Barcode
        </Button>
        {mealTypes.map((mType) => {
          const loggedMeal = meals.find((m) => m.mealType === mType.type);
          const Icon = mType.icon;

          return (
            <div
              key={mType.type}
              className="glass-card p-5 rounded-3xl border border-border/50 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{mType.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {loggedMeal
                        ? `${loggedMeal.items.length} item${loggedMeal.items.length !== 1 ? "s" : ""} · ${loggedMeal.totalCalories} kcal`
                        : "0 kcal logged"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {loggedMeal && loggedMeal.items.length > 0 && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleOpenSaveTemplateModal(
                            loggedMeal.items,
                            mType.type,
                          )
                        }
                        className="rounded-xl gap-1 text-xs text-primary hover:bg-primary/10 font-bold"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        Save Template
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMeal(loggedMeal._id)}
                        className="rounded-xl gap-1 text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveMealType(mType.type);
                      setAddModalOpen(true);
                    }}
                    className="rounded-xl gap-1 text-xs bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Add Food
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {loggedMeal && loggedMeal.items.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-border/30">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {loggedMeal.items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/20 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {item.quantity} &times; {item.serving} &middot; P:{" "}
                          {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-primary">
                          {Math.round(item.calories * item.quantity)} kcal
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(loggedMeal._id, idx)}
                          className="h-7 w-7 text-muted-foreground hover:text-red-500 rounded-lg"
                          title="Remove this item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3 italic">
                  No foods logged for {mType.label.toLowerCase()} yet.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      <Dialog
        open={customFoodModalOpen}
        onOpenChange={(open) => {
          setCustomFoodModalOpen(open);
          if (!open) resetCustomFoodForm();
        }}
      >
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-xl rounded-3xl p-3.5 sm:p-6 gap-3 sm:gap-4 max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] overscroll-contain">
          <DialogHeader className="space-y-1 pr-6 sm:pr-8">
            <DialogTitle className="text-sm sm:text-lg font-bold flex items-center gap-2">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
              <span className="truncate">{editingFoodId ? "Edit Custom Food ✏️" : "Custom Food & AI Recipe 🍳"}</span>
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground">
              Describe ingredients, cooking method and portion eaten for instant AI calculation.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher: AI Recipe Estimator vs Manual Form */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/70 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCustomTab("ai")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-center transition-all min-w-0 ${customTab === "ai"
                  ? "bg-primary text-white shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">AI Recipe Estimator</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomTab("manual")}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-center transition-all min-w-0 ${customTab === "manual"
                  ? "bg-background text-primary shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">Manual Entry</span>
            </button>
          </div>

          {/* AI Recipe Mode */}
          {customTab === "ai" && (
            <div className="space-y-3 text-xs w-full max-w-full overflow-hidden">
              {/* Quick AI Recipe Prompt Suggestions */}
              <div className="w-full max-w-full overflow-hidden">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary shrink-0" />
                  Quick Inspiration:
                </p>
                <div className="flex flex-col gap-1.5 w-full">
                  {[
                    {
                      label: "🍗 Chicken Curry (1 of 4 servings)",
                      text: "500g chicken breast, 2 potatoes (150g), 1 onion, 2 tbsp mustard oil, turmeric, chili powder. Cooked 4 servings in total, I ate 1 serving.",
                      method: "curry",
                      portion: "1 portion of 4 (25%)",
                    },
                    {
                      label: "🍳 2-Egg Omelette in Butter",
                      text: "2 whole eggs, 1 tbsp butter, chopped onions and green chilies. Ate the whole omelette.",
                      method: "pan_fry",
                      portion: "All (100%)",
                    },
                    {
                      label: "🍚 Rice & Lentil Dal Bowl",
                      text: "150g cooked basmati rice with 100g red lentil masoor dal cooked with 1 tsp ghee and cumin.",
                      method: "boil",
                      portion: "1 bowl (250g)",
                    },
                    {
                      label: "🥩 Beef Bhuna (150g portion)",
                      text: "600g lean beef cooked with 2 onions, 2 tbsp oil, ginger garlic paste and spices. Total cooked was ~500g, I ate 150g.",
                      method: "curry",
                      portion: "150g out of 500g",
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAiPrompt(preset.text);
                        setAiCookingMethod(preset.method);
                        setAiPortionEaten(preset.portion);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/40 transition-colors font-medium text-[11px] truncate"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe & Cooking Description Textarea */}
              <div className="space-y-1.5 w-full max-w-full">
                <Label className="font-semibold flex flex-wrap items-center justify-between gap-1">
                  <span>Describe Ingredients & Cooking:</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (raw weights, oil, spices)
                  </span>
                </Label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 200g chicken breast pan fried in 1 tbsp olive oil with 100g broccoli..."
                  className="w-full rounded-2xl p-3 bg-muted/40 border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all resize-none box-border"
                />
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                <div className="space-y-1 w-full">
                  <Label className="font-semibold text-xs">Cooking Method / Oil:</Label>
                  <select
                    value={aiCookingMethod}
                    onChange={(e) => setAiCookingMethod(e.target.value)}
                    className="w-full rounded-xl p-2.5 bg-muted/40 border border-border/50 text-xs outline-none focus:border-primary truncate"
                  >
                    <option value="pan_fry">Pan-fried / Sautéed (~5-7g oil)</option>
                    <option value="deep_fry">Deep-fried / Crispy (~12-15g oil)</option>
                    <option value="curry">Curry / Stew with Gravy</option>
                    <option value="bake_roast">Baked / Grilled (light oil)</option>
                    <option value="boil_steam">Boiled / Steamed (0g oil)</option>
                    <option value="raw">Raw / Fresh</option>
                  </select>
                </div>

                <div className="space-y-1 w-full">
                  <Label className="font-semibold text-xs">Total Cooked Batch:</Label>
                  <Input
                    placeholder="e.g. 500g or 4 servings"
                    value={aiTotalBatch}
                    onChange={(e) => setAiTotalBatch(e.target.value)}
                    className="rounded-xl text-xs h-10 w-full"
                  />
                </div>

                <div className="space-y-1 w-full">
                  <Label className="font-semibold text-xs">Portion Eaten:</Label>
                  <Input
                    placeholder="e.g. 20g of 100g, 1 bowl"
                    value={aiPortionEaten}
                    onChange={(e) => setAiPortionEaten(e.target.value)}
                    className="rounded-xl text-xs h-10 w-full"
                  />
                </div>
              </div>

              {/* AI Calculate Button */}
              <Button
                type="button"
                disabled={aiLoading || !aiPrompt.trim()}
                onClick={handleRunAIEstimate}
                className="w-full rounded-2xl py-3.5 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white font-bold text-xs gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                {aiLoading ? "AI is Analyzing Ingredients..." : "✨ Calculate Nutrition with AI"}
              </Button>

              {/* AI Result Card */}
              {aiResult && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 animate-in fade-in w-full overflow-hidden box-border">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      AI Calculated for Portion Eaten
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 shrink-0">
                      {Math.round((aiResult.portionEatenRatio || 1) * 100)}% portion
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                    {aiResult.explanation}
                  </p>

                  {aiResult.detectedIngredients && aiResult.detectedIngredients.length > 0 && (
                    <div className="pt-2 border-t border-emerald-500/20">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Detected Ingredients & Raw Values:
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {aiResult.detectedIngredients.map((ing: DetectedIngredient, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-background/80 border border-border/40 font-medium"
                          >
                            {ing.name} ({ing.amount}) &middot; {ing.calories} kcal
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs font-bold border-t border-emerald-500/20">
                    <div className="p-2 rounded-xl bg-background/70 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block font-medium">Calories</span>
                      <span className="text-primary text-xs sm:text-sm font-black">{aiResult.calories} kcal</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background/70 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block font-medium">Protein</span>
                      <span className="text-emerald-600 text-xs sm:text-sm font-black">{aiResult.protein}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background/70 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block font-medium">Carbs</span>
                      <span className="text-blue-600 text-xs sm:text-sm font-black">{aiResult.carbs}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background/70 border border-border/30">
                      <span className="text-[10px] text-muted-foreground block font-medium">Fat</span>
                      <span className="text-purple-600 text-xs sm:text-sm font-black">{aiResult.fat}g</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form for saving / editing the custom food (populated by AI or manual) */}
          <form onSubmit={handleSaveCustomFood} className="space-y-3 text-xs pt-2 border-t border-border/40 w-full overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <Label className="font-bold text-xs">
                {customTab === "ai" ? "Review & Finalize Food Entry:" : "Custom Food Details:"}
              </Label>
              {customCategory && (
                <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 shrink-0">
                  {customCategory.replace("_", " ")}
                </span>
              )}
            </div>

            <div className="space-y-1 w-full">
              <Label className="font-semibold text-xs">Food Name</Label>
              <Input
                placeholder="e.g. Homemade Chicken Curry (150g)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="rounded-xl font-semibold h-10 w-full"
              />
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <div className="space-y-1 w-full">
                <Label className="font-semibold text-xs">Serving Size (Base)</Label>
                <Input
                  placeholder="e.g. 100g or 1 portion (150g)"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  required
                  className="rounded-xl h-10 w-full"
                />
              </div>

              <div className="space-y-1 w-full">
                <Label className="font-semibold text-xs">Calories (kcal)</Label>
                <Input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                  required
                  className="rounded-xl font-bold text-primary h-10 w-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1 w-full">
              <div className="space-y-1 w-full">
                <Label className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-400 block">Protein (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(Number(e.target.value))}
                  className="rounded-xl h-10 font-bold w-full"
                />
              </div>
              <div className="space-y-1 w-full">
                <Label className="font-semibold text-[11px] text-blue-700 dark:text-blue-400 block">Carbs (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(Number(e.target.value))}
                  className="rounded-xl h-10 font-bold w-full"
                />
              </div>
              <div className="space-y-1 w-full">
                <Label className="font-semibold text-[11px] text-purple-700 dark:text-purple-400 block">Fat (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customFat}
                  onChange={(e) => setCustomFat(Number(e.target.value))}
                  className="rounded-xl h-10 font-bold w-full"
                />
              </div>
              <div className="space-y-1 w-full">
                <Label className="font-semibold text-[11px] text-amber-700 dark:text-amber-400 block">Fiber (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customFiber}
                  onChange={(e) => setCustomFiber(Number(e.target.value))}
                  className="rounded-xl h-10 font-bold w-full"
                />
              </div>
            </div>

            {/* Portion Test Calculator inside Custom Food Creator */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 flex flex-col gap-1 text-[11px] w-full">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>If eaten portion is <strong>20g</strong>:</span>
              </span>
              <span className="font-bold text-primary text-xs">
                {Math.round((customCalories * 20) / (extractGramsFromServing(customServing).grams || 100))} kcal &middot;{" "}
                {Math.round(((customProtein * 20) / (extractGramsFromServing(customServing).grams || 100)) * 10) / 10}g Protein
              </span>
            </div>

            <Button
              type="submit"
              className="w-full rounded-2xl py-3.5 mt-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-md"
            >
              {editingFoodId ? "Update Custom Food" : "Save Custom Food 🍳"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom Food Creation / Edit Modal with AI Recipe Estimator */}
      <Dialog
        open={customFoodModalOpen}
        onOpenChange={(open) => {
          setCustomFoodModalOpen(open);
          if (!open) resetCustomFoodForm();
        }}
      >
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-xl rounded-3xl p-4 sm:p-6 gap-3.5 sm:gap-4 max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden no-scrollbar overscroll-contain">
          <DialogHeader className="space-y-1 pr-7 sm:pr-8">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary shrink-0" />
              <span className="truncate">{editingFoodId ? "Edit Custom Food ✏️" : "Custom Food & AI Recipe 🍳"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Describe ingredients, cooking method and portion eaten for instant AI calculation.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher: AI Recipe Estimator vs Manual Form */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-muted/70 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCustomTab("ai")}
              className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl text-center transition-all min-w-0 ${customTab === "ai"
                ? "bg-primary text-white shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">AI Recipe Estimator</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomTab("manual")}
              className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl text-center transition-all min-w-0 ${customTab === "manual"
                ? "bg-background text-primary shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">Manual Entry</span>
            </button>
          </div>

          {/* AI Recipe Mode */}
          {customTab === "ai" && (
            <div className="space-y-3.5 text-xs">
              {/* Quick AI Recipe Prompt Suggestions */}
              <div className="w-full max-w-full overflow-hidden">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-primary shrink-0" />
                  Quick Inspiration:
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full">
                  {[
                    {
                      label: "🍗 Chicken Curry (1 of 4 servings)",
                      text: "500g chicken breast, 2 potatoes (150g), 1 onion, 2 tbsp mustard oil, turmeric, chili powder. Cooked 4 servings in total, I ate 1 serving.",
                      method: "curry",
                      portion: "1 portion of 4 (25%)",
                    },
                    {
                      label: "🍳 2-Egg Omelette in Butter",
                      text: "2 whole eggs, 1 tbsp butter, chopped onions and green chilies. Ate the whole omelette.",
                      method: "pan_fry",
                      portion: "All (100%)",
                    },
                    {
                      label: "🍚 Rice & Lentil Dal Bowl",
                      text: "150g cooked basmati rice with 100g red lentil masoor dal cooked with 1 tsp ghee and cumin.",
                      method: "boil",
                      portion: "1 bowl (250g)",
                    },
                    {
                      label: "🥩 Beef Bhuna (150g portion)",
                      text: "600g lean beef cooked with 2 onions, 2 tbsp oil, ginger garlic paste and spices. Total cooked was ~500g, I ate 150g.",
                      method: "curry",
                      portion: "150g out of 500g",
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAiPrompt(preset.text);
                        setAiCookingMethod(preset.method);
                        setAiPortionEaten(preset.portion);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border/40 whitespace-nowrap transition-colors shrink-0 font-medium"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipe & Cooking Description Textarea */}
              <div className="space-y-1.5">
                <Label className="font-semibold flex flex-wrap items-center justify-between gap-1">
                  <span>Describe Ingredients & Cooking:</span>
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (raw weights, oil, spices, portions)
                  </span>
                </Label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 200g chicken breast pan fried in 1 tbsp olive oil with 100g broccoli and 1 cup rice. Cooked 2 portions total, I ate 1 portion..."
                  className="w-full min-w-0 rounded-2xl p-3 bg-muted/40 border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary text-xs outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1 min-w-0">
                  <Label className="font-semibold text-xs">Cooking Method / Oil:</Label>
                  <select
                    value={aiCookingMethod}
                    onChange={(e) => setAiCookingMethod(e.target.value)}
                    className="w-full rounded-xl p-2.5 bg-muted/40 border border-border/50 text-xs outline-none focus:border-primary truncate"
                  >
                    <option value="pan_fry">Pan-fried / Sautéed (~5-7g oil)</option>
                    <option value="deep_fry">Deep-fried / Crispy (~12-15g oil)</option>
                    <option value="curry">Curry / Stew with Gravy</option>
                    <option value="bake_roast">Baked / Grilled (light oil)</option>
                    <option value="boil_steam">Boiled / Steamed (0g oil)</option>
                    <option value="raw">Raw / Fresh</option>
                  </select>
                </div>

                <div className="space-y-1 min-w-0">
                  <Label className="font-semibold text-xs">Total Cooked Batch:</Label>
                  <Input
                    placeholder="e.g. 500g or 4 servings"
                    value={aiTotalBatch}
                    onChange={(e) => setAiTotalBatch(e.target.value)}
                    className="rounded-xl text-xs h-10 w-full"
                  />
                </div>

                <div className="space-y-1 min-w-0">
                  <Label className="font-semibold text-xs">Portion Eaten:</Label>
                  <Input
                    placeholder="e.g. 20g of 100g, 1 bowl"
                    value={aiPortionEaten}
                    onChange={(e) => setAiPortionEaten(e.target.value)}
                    className="rounded-xl text-xs h-10 w-full"
                  />
                </div>
              </div>

              {/* AI Calculate Button */}
              <Button
                type="button"
                disabled={aiLoading || !aiPrompt.trim()}
                onClick={handleRunAIEstimate}
                className="w-full rounded-2xl py-3.5 sm:py-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white font-bold text-xs sm:text-sm gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                {aiLoading ? "AI is Analyzing Ingredients & Cooking..." : "✨ Calculate Nutrition with AI"}
              </Button>

              {/* AI Result Card */}
              {aiResult && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      AI Calculated for Portion Eaten
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 shrink-0">
                      {Math.round((aiResult.portionEatenRatio || 1) * 100)}% portion
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed break-words">
                    {aiResult.explanation}
                  </p>

                  {aiResult.detectedIngredients && aiResult.detectedIngredients.length > 0 && (
                    <div className="pt-2 border-t border-emerald-500/20">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                        Detected Ingredients & Raw Values:
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        {aiResult.detectedIngredients.map((ing: DetectedIngredient, i: number) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-background/80 border border-border/40 font-medium"
                          >
                            {ing.name} ({ing.amount}) &middot; {ing.calories} kcal
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-2 text-center text-xs font-bold border-t border-emerald-500/20">
                    <div className="p-2 rounded-xl bg-background/70 border border-border/30 min-w-0">
                      <span className="text-[10px] text-muted-foreground block font-medium truncate">Calories</span>
                      <span className="text-primary text-xs sm:text-sm font-black truncate block">{aiResult.calories} kcal</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background/70 border border-border/30 min-w-0">
                      <span className="text-[10px] text-muted-foreground block font-medium truncate">Protein</span>
                      <span className="text-emerald-600 text-xs sm:text-sm font-black truncate block">{aiResult.protein}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background/70 border border-border/30 min-w-0">
                      <span className="text-[10px] text-muted-foreground block font-medium truncate">Carbs</span>
                      <span className="text-blue-600 text-xs sm:text-sm font-black truncate block">{aiResult.carbs}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-background/70 border border-border/30 min-w-0">
                      <span className="text-[10px] text-muted-foreground block font-medium truncate">Fat</span>
                      <span className="text-purple-600 text-xs sm:text-sm font-black truncate block">{aiResult.fat}g</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form for saving / editing the custom food (populated by AI or manual) */}
          <form onSubmit={handleSaveCustomFood} className="space-y-3 sm:space-y-3.5 text-xs pt-2 border-t border-border/40">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <Label className="font-bold text-xs">
                {customTab === "ai" ? "Review & Finalize Food Entry:" : "Custom Food Details:"}
              </Label>
              {customCategory && (
                <span className="text-[10px] uppercase font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 shrink-0">
                  {customCategory.replace("_", " ")}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <Label className="font-semibold text-xs">Food Name</Label>
              <Input
                placeholder="e.g. Homemade Chicken Curry (150g)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="rounded-xl font-semibold h-10 w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1 min-w-0">
                <Label className="font-semibold text-xs">Serving Size (Base)</Label>
                <Input
                  placeholder="e.g. 100g or 1 portion (150g)"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  required
                  className="rounded-xl h-10 w-full"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <Label className="font-semibold text-xs">Calories (kcal)</Label>
                <Input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                  required
                  className="rounded-xl font-bold text-primary h-10 w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
              <div className="space-y-1 min-w-0">
                <Label className="font-semibold text-[11px] text-emerald-700 dark:text-emerald-400 truncate block">Protein (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(Number(e.target.value))}
                  className="rounded-xl h-10 font-bold w-full"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="font-semibold text-[11px] text-blue-700 dark:text-blue-400 truncate block">Carbs (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(Number(e.target.value))}
                  className="rounded-xl h-10 font-bold w-full"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="font-semibold text-[11px] text-purple-700 dark:text-purple-400 truncate block">Fat (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customFat}
                  onChange={(e) => setCustomFat(Number(e.target.value))}
                  className="rounded-xl h-10 font-bold w-full"
                />
              </div>
              <div className="space-y-1 min-w-0">
                <Label className="font-semibold text-[11px] text-amber-700 dark:text-amber-400 truncate block">Fiber (g)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={customFiber}
                  onChange={(e) => setCustomFiber(Number(e.target.value))}
                  className="rounded-xl h-10 font-bold w-full"
                />
              </div>
            </div>

            {/* Portion Test Calculator inside Custom Food Creator */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 text-[11px]">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>If eaten portion is <strong>20g</strong>:</span>
              </span>
              <span className="font-bold text-primary text-xs sm:text-[11px] self-end sm:self-auto">
                {Math.round((customCalories * 20) / (extractGramsFromServing(customServing).grams || 100))} kcal &middot;{" "}
                {Math.round(((customProtein * 20) / (extractGramsFromServing(customServing).grams || 100)) * 10) / 10}g Protein
              </span>
            </div>

            <Button
              type="submit"
              className="w-full rounded-2xl py-3.5 sm:py-4 mt-2 sm:mt-3 bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-md"
            >
              {editingFoodId ? "Update Custom Food" : "Save Custom Food 🍳"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Save Meal Template Dialog */}
      <Dialog
        open={saveTemplateModalOpen}
        onOpenChange={setSaveTemplateModalOpen}
      >
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-md rounded-3xl p-4 sm:p-6 gap-3.5 sm:gap-4 max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden no-scrollbar overscroll-contain">
          <DialogHeader className="pr-7 sm:pr-8">
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary shrink-0" />
              <span>Save Meal as Template</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTemplate} className="space-y-4 text-xs">
            <div className="space-y-1">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g. Daily Gym Breakfast, Office Lunch"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                required
                className="rounded-xl text-sm font-semibold w-full"
              />
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {[
                  { id: "breakfast", label: "Breakfast" },
                  { id: "lunch", label: "Lunch" },
                  { id: "dinner", label: "Dinner" },
                  { id: "iftar", label: "Iftar" },
                  { id: "gym_meal", label: "Gym Meal" },
                  { id: "office_lunch", label: "Office Lunch" },
                  { id: "cheat_meal", label: "Cheat Meal" },
                  { id: "custom", label: "Custom" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setTemplateCategory(cat.id as SavedMealCategory)
                    }
                    className={`p-2 rounded-xl text-xs font-bold text-left transition-all border ${templateCategory === cat.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-muted/40 border-border/40 text-muted-foreground"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/40 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Items in Template ({itemsToSave.length})
              </p>
              <p className="text-xs font-medium text-foreground truncate">
                {itemsToSave.map((i) => i.name).join(", ")}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl py-3.5 bg-primary hover:bg-primary/90 font-bold text-xs sm:text-sm"
            >
              Save Template 🔖
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer Ad Slot */}
      <AdUnit size="auto" maxWidth="970px" />
    </div>
  );
}
