<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# NutriBD (fit-os) — AI Context

> Dense project brief for AI agents. Read this first. Keep it in sync when conventions change.

## What it is
AI fitness & nutrition platform localized for Bangladesh. Tracks meals, workouts, weight, water, sleep, body measurements; Gemini-powered coaching + natural-language recipe estimation.

## Stack
Next.js **16** (App Router, Turbopack) · React **19** · TypeScript 5 (strict, alias `@/*`) · Tailwind 3.4 (glassmorphism) · MongoDB + Mongoose 8 · Clerk v6 · Google Gemini (`gemini-2.5-flash`, fallback `gemini-flash-latest`) · `recharts`, `react-hot-toast`, `next-themes`, `lucide-react`, `date-fns`, `framer-motion`, `zod` · PWA via `@ducanh2912/next-pwa`.

Removed on purpose (do not re-add): `react-hook-form`, `@hookform/resolvers`, most `@radix-ui/*` tooltip/separator, and unused shadcn primitives (`card/form/table/textarea/separator/toaster/tooltip`).

## Commands
```bash
npm run dev      # dev server
npm run build    # next build (runs type check)
npm run lint     # eslint .  → expect 0 errors; 13 intentional warnings (react-hooks/set-state-in-effect)
npx tsc --noEmit # fast type check
```
**Definition of done: `tsc` clean + `lint` 0 errors + `build` succeeds (14/14 pages).**

## Architecture map
- `app/` — routes. `(auth)/` (Clerk + calculators), `(root)/` (dashboard, diet, workout, progress, analytics, profile, settings), `api/barcode/...`.
- `components/` — `navigation/` (BottomNav, DesktopSidebar, TopNavbar, NavigationSheet), `shared/` (PageHeader, NutritionSummary, modals), `ui/` (Radix primitives).
- `lib/actions/*.actions.ts` — **all** server actions (`"use server"`).
- `lib/database/models/*` — Mongoose models; `lib/database/index.ts` = `connectToDatabase()`.
- `types/fitness.ts` — shared TS types. `validations/fitness.ts` — Zod schemas. `public/foods.ts` — default food seed.

## Hard constraints (must follow)
- **Auth: Clerk is the single source of truth.** No local user table. Every action: `await connectToDatabase()`, `const user = await currentUser()` guard, scope queries by `user.id` (clerkId), then `revalidatePath(...)`.
- **Middleware = `proxy.ts`** (Next 16 / Clerk v6). Do NOT create `middleware.ts`.
- **Brand color** = CSS var `--primary` (use `text-primary`/`bg-primary`). Never hardcode hex.
- **Version single source** = `lib/constants.ts` (`VERSION_RAW`, `VERSION`, `APP_CONFIG`). Never hardcode a version string.
- **Root layout must keep** `BodyInteractionGuard` (fixes Radix `react-remove-scroll` body-lock freezes). Never remove it.
- Auth layouts use `min-h-[100dvh]`; PWA = `standalone` + `portrait-primary`.
- Mobile nav (`BottomNav`) needs `touch-manipulation select-none`.
- Shared UI rhythm: use `PageHeader` for page titles and `NutritionSummary` for macro rings.
- Dashboard layout = A–E segments (Header / Nutrition / Quick Actions / Today's Meals / Habits).
- **Nutrition targets must come from one place** — `getProfileNutritionTargets()` / `calculateRecommendedMacros()` — so Diet and Profile never drift.

## Domain logic (reuse, don't reinvent)
- `lib/food-portion.ts` — `extractGramsFromServing`, `calculateNutritionByGrams`, `calculateNutritionByMultiplier` (dual portion modes).
- `lib/health-calculations.ts` — BMI, body-fat %, WHR, WHtR, LBM/fat-mass.
- `lib/actions/profile.actions.ts` — `calculateRecommendedMacros` (Mifflin-St Jeor BMR → TDEE multipliers → protein 2.0g/kg, fat 25%), `getProfileNutritionTargets`.
- `lib/events.ts` — `notifyDataUpdated(category)` after mutations + `useDataUpdateListener` for live cross-component refresh.
- Models: UserProfile, MealLog, WorkoutLog, WeightLog, BodyMeasurement, SleepLog, WaterLog, Food, SavedMeal, WorkoutPlan.

## AI food estimation (current design)
`lib/actions/ai-food.actions.ts` · `estimateFoodNutritionWithAI(input: AIEstimateInput)` where input = `{ description, ingredients?, cookingMethod?, cookedPortionTotal?, portionEaten? }`.
- Deterministic engine `NUTRITION_BASE` (per-100g) + `KEY_ALIASES` / `KEY_PATTERNS` / `canonicalize()` + `parseIngredientSnippet` (word-boundary matching — avoids false hits like `"boiled"→"oil"`).
- `fallbackCalculateNutrition()` runs when no API key / API error (offline-safe).
- Prompt is Bangladeshi-tuned: BD food reference table, household portion sizes (1 katori/bati ≈150g, 1 thala rice ≈250g, ruti ≈35g, egg ≈50g), anti-hallucination rules.
- Diet page AI tab = **guided 5-field portion form** (`AI_PRESETS` templates), filling the review form; keeps `portionEaten` honored in post-processing.

## Gotchas / lessons learned
- Don't cache `seedFoods()` at module scope → React purity lint errors. `getFoods` already falls back to `public/foods` when DB is empty.
- `BarcodeScanner` recursive `requestAnimationFrame` must use **named** function expressions (TDZ errors otherwise).
- Rapid Radix modal hand-offs leak `<body>` scroll-lock; `BodyInteractionGuard` cleans it — don't bypass.
- Custom foods: created with `isCustom:true, isBangladeshi:false`; edit/delete are owner-only.
- `react-hooks/set-state-in-effect` is `warn` on purpose (mount detection / modal sync). Don't "fix" them.
- Prefer `npx tsc --noEmit && npm run build` for verification when lint tooling misbehaves.
