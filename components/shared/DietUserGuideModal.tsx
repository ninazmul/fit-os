"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Sparkles,
  Users,
  BrainCircuit,
  Scale,
  Bookmark,
  ShieldCheck,
  Flame,
  UtensilsCrossed,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

interface DietUserGuideModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectSamplePrompt?: (prompt: string) => void;
}

type GuideTab = "overview" | "ai" | "community" | "training" | "portions" | "templates";

const SAMPLE_PROMPTS = [
  {
    title: "Bangladeshi Chicken Curry (Eaten 50g)",
    prompt: "500g chicken curry cooked with 2 tbsp mustard oil, onions, garlic and spices. Eaten portion 50g",
    category: "curry_meat",
  },
  {
    title: "Beef Kala Bhuna (Rich & Spiced)",
    prompt: "Beef kala bhuna braised with fried onions, dark roasted spices and ghee. Ate 120g",
    category: "curry_meat",
  },
  {
    title: "Breakfast Eggs & Roti",
    prompt: "2 eggs fried in 1 tsp oil with 2 handmade atta roti",
    category: "dairy_eggs",
  },
  {
    title: "Gym High-Protein Rice Bowl",
    prompt: "200g cooked basmati rice with 150g grilled chicken breast and 50g steamed broccoli",
    category: "rice_grains",
  },
];

export default function DietUserGuideModal({
  open,
  onOpenChange,
  onSelectSamplePrompt,
}: DietUserGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>("overview");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-2xl rounded-3xl p-0 max-h-[88dvh] flex flex-col overflow-hidden border bg-background shadow-2xl box-border min-w-0">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border/40 shrink-0 pr-12">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>NutriBD Complete User Guide</span>
          </div>
          <DialogTitle className="text-base sm:text-xl font-bold flex items-center gap-2">
            <span>How to Use Diet, AI &amp; Community Foods 🥗</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Everything you need to know about tracking nutrition, AI recipe calculations, community foods, and continuous AI learning.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation Pill Bar */}
        <div className="px-4 sm:px-5 pt-3 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            {[
              { id: "overview", label: "Overview", icon: UtensilsCrossed },
              { id: "ai", label: "AI Recipe Estimator", icon: Sparkles },
              { id: "community", label: "Community Foods", icon: Users },
              { id: "training", label: "AI Continuous Learning", icon: BrainCircuit },
              { id: "portions", label: "Portion Calculator", icon: Scale },
              { id: "templates", label: "Templates & Barcode", icon: Bookmark },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as GuideTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all text-xs ${
                    isActive
                      ? "bg-primary text-white font-bold shadow-xs"
                      : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain pb-6 text-xs text-muted-foreground">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-foreground space-y-1.5">
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-primary">
                  <UtensilsCrossed className="w-4 h-4" /> Welcome to NutriBD Nutrition Tracker
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  NutriBD is tailored specifically for Bangladeshi and global lifestyles. It combines verified traditional dishes, precise portion calculators, AI-powered recipe macro estimation, and a growing community database.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                      <Flame className="w-4 h-4" />
                    </span>
                    <span>Daily Calorie &amp; Macro Goals</span>
                  </div>
                  <p className="text-muted-foreground">
                    Your daily calories, protein, carbs, fat, and fiber are calculated automatically based on your profile and fitness goal (weight loss, muscle gain, or maintenance).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                      <UtensilsCrossed className="w-4 h-4" />
                    </span>
                    <span>4 Meal Categories</span>
                  </div>
                  <p className="text-muted-foreground">
                    Log food under <strong>Breakfast</strong>, <strong>Lunch</strong>, <strong>Dinner</strong>, or <strong>Snacks</strong>. Each category shows its own subtotal and calorie distribution.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                      <Users className="w-4 h-4" />
                    </span>
                    <span>Shared Community Foods</span>
                  </div>
                  <p className="text-muted-foreground">
                    Every custom dish created by any user is shared in the catalog, allowing the database to expand into thousands of authentic recipes.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                      <BrainCircuit className="w-4 h-4" />
                    </span>
                    <span>Trained-by-Time AI</span>
                  </div>
                  <p className="text-muted-foreground">
                    The AI continuously references all custom dishes created over time to deliver ultra-realistic macro calculations for home cooking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI RECIPE ESTIMATOR */}
          {activeTab === "ai" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-foreground space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-primary">
                  <Sparkles className="w-4 h-4" /> 1-Field AI Recipe Estimator
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You don’t have to fill in 10 different form inputs! Simply describe what you cooked and what you ate into <strong>one single box</strong>. Our AI calculates everything and automatically fills all fields.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  How to Write Your Description for Best Accuracy:
                </h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-card border border-border/50 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Specify the Eaten Portion:</strong>
                      <p className="text-muted-foreground mt-0.5">
                        If you ate 50g, simply write <code>eaten portion 50g</code> or <code>ate 50g</code>. The AI will set <strong>Serving Size = 50g</strong> and scale the calories &amp; macros strictly for that 50g (NOT the whole batch!).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-card border border-border/50 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Bangladeshi Spices &amp; Oil (&ldquo;Koshano&rdquo; Style):</strong>
                      <p className="text-muted-foreground mt-0.5">
                        Traditional Bangladeshi curries, bhunas, and biryanis are naturally rich in oil and spices. The AI automatically factors in authentic cooking oil and ghee absorption unless you specify a boiled or zero-oil preparation.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-card border border-border/50 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-foreground">Review &amp; Edit Before Saving:</strong>
                      <p className="text-muted-foreground mt-0.5">
                        After the AI calculates, it fills the dish name, category, serving size, calories, protein, carbs, fat, and fiber. You can review and tweak any number before clicking <strong>Save Food</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Try Sample Prompts:</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Click to copy or use</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_PROMPTS.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-muted/40 border border-border/50 flex flex-col justify-between gap-2 hover:border-primary/40 transition-all"
                    >
                      <div>
                        <p className="font-bold text-foreground text-xs">{sp.title}</p>
                        <p className="text-[11px] text-muted-foreground italic mt-0.5 line-clamp-2">
                          &ldquo;{sp.prompt}&rdquo;
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(sp.prompt, idx)}
                          className="h-6 text-[10px] px-2 rounded-lg gap-1 border-border/60"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </Button>
                        {onSelectSamplePrompt && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              onSelectSamplePrompt(sp.prompt);
                              onOpenChange(false);
                            }}
                            className="h-6 text-[10px] px-2 rounded-lg bg-primary text-white font-semibold"
                          >
                            Use in AI Estimator &rarr;
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMUNITY FOODS & OWNERSHIP */}
          {activeTab === "community" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-foreground space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Users className="w-4 h-4" /> Shared Community Food Database
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every custom food you or other users create is automatically shared across the platform. This transforms NutriBD into an ever-expanding, crowdsourced Bangladeshi &amp; global food database!
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">
                  Understanding Food Badges:
                </h4>

                <div className="p-3 rounded-2xl bg-card border border-border/50 flex items-start gap-3">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold shrink-0 mt-0.5">
                    My Custom
                  </span>
                  <div>
                    <strong className="text-foreground">Custom Foods Created by You:</strong>
                    <p className="text-muted-foreground mt-0.5">
                      You have full ownership. You can log it, adjust portions, and you are the <strong>only person</strong> who can edit (<kbd>Pencil</kbd>) or delete (<kbd>Trash</kbd>) this food.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/50 flex items-start gap-3">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold shrink-0 mt-0.5">
                    Community
                  </span>
                  <div>
                    <strong className="text-foreground">Shared by Other Community Users:</strong>
                    <p className="text-muted-foreground mt-0.5">
                      You can search for it, view all nutrition data, scale it by grams or multiplier, and log it to your daily meals anytime.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/50 flex items-start gap-3">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold shrink-0 mt-0.5">
                    BD
                  </span>
                  <div>
                    <strong className="text-foreground">Built-in Bangladeshi Staples:</strong>
                    <p className="text-muted-foreground mt-0.5">
                      Verified traditional staples like Shahi Polao, Kacchi Biryani, Rui Macher Jhol, Alu Bhorta, Begun Vaji, Singara, and Chotpoti.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Strict Ownership Protection:</strong>
                  <p className="text-muted-foreground mt-0.5">
                    To prevent tampering or data loss, non-owners cannot edit or delete community foods. The system strictly checks user identity on both the UI and the secure database server.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTINUOUS AI TRAINING */}
          {activeTab === "training" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-foreground space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                  <BrainCircuit className="w-4 h-4" /> Continuous AI Learning (&ldquo;Trained by Time&rdquo;)
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  How does our AI become smarter over time? NutriBD employs dynamic in-context retrieval to continuously train the AI on the latest user-verified recipes in the database!
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px]">
                      1
                    </span>
                    <span>Real-Time Database Retrieval</span>
                  </div>
                  <p className="text-muted-foreground pl-7">
                    Whenever you run the AI Recipe Estimator, the system retrieves the most recent and keyword-matched custom foods created by users across the platform.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px]">
                      2
                    </span>
                    <span>Dynamic Few-Shot Learning</span>
                  </div>
                  <p className="text-muted-foreground pl-7">
                    These real custom food entries are injected into the AI&rsquo;s training context. The AI analyzes how real home cooks prepare dishes, the actual oil and ghee amounts used, and realistic portion weights.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-foreground">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px]">
                      3
                    </span>
                    <span>Smart Fallback Calibration</span>
                  </div>
                  <p className="text-muted-foreground pl-7">
                    Even when offline or in fallback mode, our deterministic culinary engine compares your dish against community custom foods to guarantee consistent, accurate macro estimates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PORTION CALCULATOR */}
          {activeTab === "portions" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-foreground space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Scale className="w-4 h-4" /> Flexible Portion Calculator
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No two meals are the same weight! When selecting any dish from the catalog, you can adjust the portion in two ways:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-card border border-border/50 space-y-2">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <span>🔢 Mode 1: Multiplier</span>
                  </h4>
                  <p className="text-muted-foreground">
                    Scale by serving count using quick buttons (<code>0.5x</code>, <code>1x</code>, <code>1.5x</code>, <code>2x</code>, <code>3x</code>) or type any custom quantity.
                  </p>
                  <div className="p-2 rounded-xl bg-muted/40 text-[11px]">
                    <strong>Example:</strong> 1 plate (250g) at <code>1.5x</code> = 375g portion calculated instantly.
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border/50 space-y-2">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-1.5">
                    <span>⚖️ Mode 2: Grams (Scale Mode)</span>
                  </h4>
                  <p className="text-muted-foreground">
                    Weigh your food on a kitchen scale and type the exact grams you ate (e.g. <code>85g</code>).
                  </p>
                  <div className="p-2 rounded-xl bg-muted/40 text-[11px]">
                    <strong>Example:</strong> If base serving is 250g (300 kcal) and you ate 100g, NutriBD scales calories to exactly 120 kcal.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TEMPLATES & BARCODES */}
          {activeTab === "templates" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-foreground space-y-2">
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Bookmark className="w-4 h-4" /> Save Meal Templates &amp; Scan Barcodes
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save time on recurring meals and packaged items:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-primary" />
                    <span>Saved Meal Templates (1-Tap Logging)</span>
                  </h4>
                  <p className="text-muted-foreground">
                    Do you eat the same breakfast or gym meal every day? Click <strong>&ldquo;Save as Template&rdquo;</strong> in any meal card. It creates a 1-tap template at the top carousel so you can log your entire meal in 1 second tomorrow!
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border/50 space-y-1.5">
                  <h4 className="font-bold text-foreground text-xs flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span>Barcode Scanner</span>
                  </h4>
                  <p className="text-muted-foreground">
                    Tap the barcode button to scan packaged snacks, oats, milk, or protein powders using your camera. NutriBD looks up verified nutrition facts automatically.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/40 bg-muted/20 flex items-center justify-between gap-2 shrink-0">
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Have questions? Check the AI Recipe Estimator or Portion Calculator anytime!
          </p>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 w-full sm:w-auto"
          >
            Got it, let&rsquo;s track! &rarr;
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
