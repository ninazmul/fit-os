<div align="center">

# 🌐 NutriBD (v2.2.1)

### AI-Powered Fitness, Nutrition & Health Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16_(Turbopack)-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

_A state-of-the-art, high-performance AI fitness & nutrition intelligence platform tailored for Bangladesh and worldwide. Track meals, workouts, weight, water, sleep, and 9-point body measurements with real-time Google Gemini AI coaching, natural language culinary recipe estimation, camera barcode scanning, and goal trajectory forecasting._

[Live Demo](https://nutribd.com) · [Report Bug](https://github.com/ninazmul/nutribd/issues) · [Request Feature](https://github.com/ninazmul/nutribd/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [What's New in v2.2.1](#-whats-new-in-v221)
- [Key Features & Functional Breakdown](#-key-features--functional-breakdown)
  - [🤖 AI Health Intelligence Engine (Gemini AI)](#-ai-health-intelligence-engine-gemini-ai)
  - [🍽️ Diet & Nutrition Tracker](#-diet--nutrition-tracker)
  - [💪 Workout & Training Tracker](#-workout--training-tracker)
  - [📈 Progress, Body Analytics & Recomposition](#-progress-body-analytics--recomposition)
  - [💤 Sleep & Recovery Tracker](#-sleep--recovery-tracker)
  - [💧 Hydration Tracker](#-hydration-tracker)
  - [👤 Profile & Biometric Engine](#-profile--biometric-engine)
- [⚡ Performance, Indexing & Architecture](#-performance-indexing--architecture)
  - [Database Indexing Schema](#database-indexing-schema)
  - [N+1 Query Elimination & DSA](#n1-query-elimination--dsa)
  - [Lazy Loading & Client Component Optimization](#lazy-loading--client-component-optimization)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Database Models](#-database-models)
- [Main Application Routes](#-main-application-routes)
- [Scripts Reference](#-scripts-reference)
- [Contributing](#-contributing)
- [License](#-license)
- [Author & Credits](#-author--credits)

---

## 🚀 Overview

**NutriBD** is an all-in-one AI fitness and nutrition intelligence platform built for modern lifestyles and localized nutrition (including a comprehensive Bangladeshi & international food database).

It combines **Google Gemini AI** with precision exercise science and metabolic algorithms to provide:
- **AI Health Score (0–100)** with interactive **Ask AI Coach** Q&A.
- **Natural Language Recipe Estimation** (parse home-cooked ingredients, cooking oils, batch sizes, and eaten portions into exact macros).
- **Goal Trajectory & Milestone Forecasting** (real-time velocity calculation and plateau risk detection).
- **Body Recomposition Matrix** (analyzes 9-point circumference changes vs. weight velocity to track fat loss vs. muscle retention).
- **Barcode Scanner** & dual-mode portion calculator (multiplier mode and gram-scale mode).
- **12:00 AM Midnight Day Reset** synced to user's local timezone.
- **Sub-150KB First Load JS** with intelligent component lazy loading and compound MongoDB indexing.

---

## ⚡ What's New in v2.2.1

- **Dependency Optimization:** Removed heavy unused dependencies (`html2canvas`, `jspdf`, `xlsx`) and pruned 30+ transitive packages; replaced with zero-dependency browser standards (`Blob`, UTF-8 CSV exports, and native `window.print()`).
- **Comprehensive MongoDB Compound & Text Indexing:** Tailored compound indexes across all collections (`MealLog`, `WorkoutLog`, `WeightLog`, `Food`, `SavedMeal`, `BodyMeasurement`), eliminating unindexed collscans.
- **Elimination of N+1 & Unbounded Queries:** Bounded streak tracking to 365 days, added index-backed projection in personal records queries, and scoped weight history queries.
- **Lazy Loading with Recharts:** Replaced top-level Recharts imports with standalone dynamically loaded components (`WeeklyNutritionChart` & `WeeklyWeightChart`) and skeleton placeholders.

---

## ✨ Key Features & Functional Breakdown

### 🤖 AI Health Intelligence Engine (Gemini AI)

- **AI Health & Performance Score (0–100):** Multi-dimensional score evaluating Nutrition (35%), Workouts (25%), Recovery (20%), and Hydration (20%) with component sub-rings.
- **Executive Coach Briefing:** Weekly holistic summary of physical progress, key strengths, and growth areas.
- **Interactive Ask AI Coach:** Live context-aware Q&A chat assistant with quick prompt pills, tailored specifically to the user's live profile, diet logs, and workout history.
- **7-Day Action Gameplan:** High-impact, prioritized action checklist for the coming week.
- **AI-Detected Cross-Metric Correlations:** Surfaces physiological relationships (e.g., Sleep Duration vs. Workout Consistency, Hydration vs. Scale Weight Stability).
- **Categorized Insights:** Filterable by *Nutrition*, *Training*, *Recovery*, *Longevity*, and *Habits*.

### 🍽️ Diet & Nutrition Tracker

- **Natural Language AI Recipe Estimator:** Describe any home-cooked dish (ingredients, cooking method, batch size vs. portion eaten) to calculate exact calories, protein, carbs, fat, and fiber.
- **Dual-Mode Portion & Gram Calculator:** Switch seamlessly between multiplier servings (e.g., $1.5\times$) and exact grams (e.g., eating 20g from a 100g database entry) with auto-proportional scaling.
- **Barcode Scanner:** Real-time camera barcode scanner with OpenFoodFacts integration and local fallback.
- **Bangladeshi & Global Food Database:** Curated food items covering traditional curries, rice, lentils, street food, and international items.
- **Meal Bucketing & Daily Rings:** Breakfast, Lunch, Dinner, and Snacks tracking with real-time calorie and macronutrient progress rings.
- **Saved & Recent Meals:** One-tap re-logging of frequent meals.

### 💪 Workout & Training Tracker

- **Session Logging:** Track workout types (Strength, Cardio, HIIT, Sports, Functional), duration, exercises, sets, reps, weight lifted, and estimated calorie burn.
- **Personal Records (PRs):** High-speed server action projection calculating personal records across volume ($weight \times reps$) per exercise.
- **Consistency Monitor:** Weekly workout frequency counter against profile targets with recovery pacing.

### 📈 Progress, Body Analytics & Recomposition

- **AI Goal Trajectory Forecaster:** Predicts target weight arrival date based on actual weight delta velocity, deficit/surplus, and plateau detection.
- **AI Body Recomposition Matrix:** Evaluates 9-point circumference delta against scale weight to assess muscle retention vs. fat loss.
- **9-Point Body Measurement Modal:** Logs Chest, Waist, Hips, Shoulders, Neck, Arm (Bicep), Forearm, Thigh, and Calf with historical delta badges.
- **Longitudinal Weight Charts:** Interactive 7, 30, and 60-day trend lines with moving averages and linear regression forecasts.

### 💤 Sleep & Recovery Tracker

- **Dual-Mode Sleep Tracking:** Log multi-session sleep periods (e.g., night sleep + afternoon power naps) with sleep/wake timestamps, duration, and quality ratings (1–5 stars).
- **Quality Aggregations:** Calculates rolling sleep averages and correlates recovery quality with workout performance.

### 💧 Hydration Tracker

- **Quick-Tap Logging:** Presets for 250ml (Cup), 500ml (Bottle), and 1000ml (Large Flask).
- **Daily Target Rings:** Real-time hydration percentage tracking against personalized daily targets based on body weight.

### 👤 Profile & Biometric Engine

- **Comprehensive Health Metrics:** Calculates BMI, Mifflin-St Jeor BMR, Activity-Adjusted TDEE, Waist-to-Hip Ratio (WHR), Waist-to-Height Ratio (WHtR), and US Navy Body Fat Percentage.
- **Adaptive Macro Calculations:** Automatically recalibrates daily calories, protein (2.0g/kg), fat (25%), carbs, and fiber targets whenever weight updates.

---

## ⚡ Performance, Indexing & Architecture

### Database Indexing Schema

Every model includes tailored indexes matching the primary queries of the application:

```typescript
// MealLog
MealLogSchema.index({ clerkId: 1, date: 1, mealType: 1 }, { unique: true });
MealLogSchema.index({ clerkId: 1, date: 1 });
MealLogSchema.index({ clerkId: 1, createdAt: -1 });

// Food
FoodSchema.index({ name: "text" });
FoodSchema.index({ isCustom: 1, clerkId: 1 });
FoodSchema.index({ isCustom: 1, category: 1 });
FoodSchema.index({ name: 1, category: 1 });

// WorkoutLog
WorkoutLogSchema.index({ clerkId: 1, date: -1 });
WorkoutLogSchema.index({ clerkId: 1, date: 1 });
WorkoutLogSchema.index({ clerkId: 1, "exercises.exerciseName": 1 });

// WeightLog
WeightLogSchema.index({ clerkId: 1, date: -1 }, { unique: true });
WeightLogSchema.index({ clerkId: 1, date: 1 });

// SavedMeal
SavedMealSchema.index({ clerkId: 1, usageCount: -1, createdAt: -1 });

// BodyMeasurement
BodyMeasurementSchema.index({ clerkId: 1, date: -1, updatedAt: -1 });
```

### N+1 Query Elimination & DSA

- **Bounded Streak Calculation:** Uses a 365-day indexed date cutoff (`date: { $gte: oneYearAgoStr }`) and builds an in-memory `Set<string>` for $O(1)$ consecutive day lookups.
- **Selective Projection for PRs:** Fetches only `{ "exercises.exerciseName": 1, "exercises.sets.weight": 1, "exercises.sets.reps": 1, date: 1 }` to compute volume records in a single linear pass.
- **Parallel Multi-Range Stats:** Resolves counts, latest readings, and 30-day windows concurrently via `Promise.all`.

### Lazy Loading & Client Component Optimization

- Heavy charting libraries (`Recharts`, ~250KB) are split out into standalone components (`WeeklyNutritionChart` & `WeeklyWeightChart`) and imported with `next/dynamic({ ssr: false })` + skeleton loaders.
- Dashboard initial bundle size is minimized (~133 kB First Load JS).

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router + Turbopack)](https://nextjs.org/) + [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + CSS Variables Glassmorphism |
| **UI Components** | [Radix UI Primitives](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Charts** | [Recharts 3](https://recharts.org/) (Lazy-Loaded) |
| **Database & ODM** | [MongoDB](https://www.mongodb.com/) + [Mongoose 8](https://mongoosejs.com/) |
| **Authentication** | [Clerk Authentication](https://clerk.com/) |
| **AI Intelligence** | [Google Gemini AI API](https://ai.google.dev/) (`gemini-1.5-flash`) |
| **Barcode Scanning** | [Html5-Qrcode](https://github.com/mebjas/html5-qrcode) + OpenFoodFacts API |
| **Form Validation** | [React Hook Form](https://react-hook-form.com/) + [Zod 3](https://zod.dev/) |
| **PWA Support** | [@ducanh2912/next-pwa](https://github.com/DuCanhDe/next-pwa) |

---

## 🏁 Getting Started

### Prerequisites

- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (or `pnpm` / `yarn`)
- **MongoDB Database**: Local MongoDB instance or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **Clerk Account**: For user management ([clerk.com](https://clerk.com/))
- **Google AI Studio API Key**: For Gemini AI capabilities ([aistudio.google.com](https://aistudio.google.com/))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ninazmul/nutribd.git
cd nutribd

# 2. Install dependencies
npm install
```

### Environment Configuration

Create a `.env.local` file in the project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nutribd?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Google Gemini AI API
GEMINI_API_KEY=AIzaSy...

# Public Application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Running the Application

```bash
# Start local development server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 📂 Project Structure

```
fit-os/
├── app/
│   ├── (auth)/              # Clerk sign-in and sign-up pages
│   ├── (root)/              # Core authenticated application pages
│   │   ├── analytics/       # AI Health Score, Executive Briefing, Ask AI Coach
│   │   ├── diet/            # Meal logging, barcode scan, AI recipe parser
│   │   ├── profile/         # Biometrics, metabolic profiling, macro adjustments
│   │   ├── progress/        # Body recomposition, 9-point measurements, weight trends
│   │   ├── settings/        # App preferences & version details
│   │   ├── workout/         # Workout logging, PR tracking, exercise history
│   │   ├── layout.tsx       # Root layout with DesktopSidebar & BottomNav
│   │   └── page.tsx         # Daily Mission Dashboard
│   ├── api/                 # Barcode and external integration endpoints
│   ├── globals.css          # Design system, CSS variables & glassmorphic tokens
│   └── layout.tsx           # ClerkProvider & ThemeProvider wrapper
├── components/
│   ├── dashboard/           # Lazy-loaded dashboard charts (WeeklyNutrition, WeeklyWeight)
│   ├── navigation/          # DesktopSidebar, BottomNav, TopNavbar, NavigationSheet
│   ├── shared/              # StatCard, BarcodeScanner, BodyMeasurementModal, QuickAdd
│   └── ui/                  # Radix UI primitives (Button, Dialog, Tabs, etc.)
├── lib/
│   ├── actions/             # Next.js Server Actions (AI, meals, workouts, weights)
│   │   ├── ai-analytics.actions.ts  # Health Score, executive briefing, Ask AI Coach
│   │   ├── ai-progress.actions.ts   # Trajectory forecasting & recomposition
│   │   ├── ai-profile.actions.ts    # Metabolic profiling & longevity roadmap
│   │   ├── ai-food.actions.ts       # Natural language recipe parser & macro calculator
│   │   ├── dashboard.actions.ts     # Daily aggregations, mission & streak
│   │   ├── workout.actions.ts       # Workout logging & PR calculations
│   │   ├── weight.actions.ts        # Weight stats & adaptive macro adjustments
│   │   └── ...                      # Core database CRUD actions
│   ├── database/            # Mongoose models & database connection
│   ├── constants.ts         # Centralized branding, versioning (v2.2.1) & global config
│   ├── export-utils.ts      # Native zero-dependency CSV and print export utilities
│   ├── food-portion.ts      # Dual-mode portion & gram quantity calculator
│   └── utils.ts             # Date formatting & timezone midnight synchronization
├── types/                   # Global TypeScript definitions
└── package.json             # Project dependencies & scripts
```

---

## 🗄️ Database Models

| Model | Description | Key Fields & Indexes |
| :--- | :--- | :--- |
| **`UserProfile`** | Core user biometrics & goals | `clerkId` (unique), `age`, `gender`, `height`, `currentWeight`, `targetWeight`, `goal`, `activityLevel`, `dailyCaloriesGoal`, `dailyProteinGoal`, `waterGoalMl` |
| **`MealLog`** | Daily nutrition logs | `clerkId`, `date`, `mealType`, `items`, `totalCalories`, `totalProtein`, `totalCarbs`, `totalFat`<br>Indexes: `{ clerkId, date, mealType }` (unique), `{ clerkId, date }`, `{ clerkId, createdAt }` |
| **`WorkoutLog`** | Training sessions | `clerkId`, `date`, `title`, `workoutType`, `durationMinutes`, `caloriesBurned`, `exercises`<br>Indexes: `{ clerkId, date }`, `{ clerkId, "exercises.exerciseName" }` |
| **`WeightLog`** | Daily scale entries | `clerkId`, `date`, `weight`, `notes`<br>Indexes: `{ clerkId, date }` (unique), `{ clerkId, date: 1 }` |
| **`BodyMeasurement`** | 9-point circumference logs | `clerkId`, `date`, `waist`, `chest`, `hip`, `neck`, `shoulder`, `arm`, `forearm`, `thigh`, `calf`<br>Indexes: `{ clerkId, date, updatedAt }` |
| **`SleepLog`** | Sleep & recovery sessions | `clerkId`, `date`, `totalHours`, `sessions` (`sleepTime`, `wakeTime`, `totalHours`, `quality`, `notes`)<br>Indexes: `{ clerkId, date }` (unique) |
| **`WaterLog`** | Daily hydration records | `clerkId`, `date`, `totalMl`, `entries` (`amountMl`, `time`)<br>Indexes: `{ clerkId, date }` (unique) |
| **`Food`** | Food item database | `name`, `category`, `servingSize`, `calories`, `protein`, `carbs`, `fat`, `fiber`, `isCustom`, `clerkId`<br>Indexes: `text(name)`, `{ isCustom, clerkId }`, `{ isCustom, category }` |
| **`SavedMeal`** | User-saved meal presets | `clerkId`, `name`, `category`, `items`, `totalCalories`, `usageCount`<br>Indexes: `{ clerkId, usageCount, createdAt }` |

---

## 🗺️ Main Application Routes

| Route | Purpose | Key Features |
| :--- | :--- | :--- |
| `/` | Daily Dashboard | Quick log, calorie/macro rings, hydration progress, mission checklist, lazy-loaded charts |
| `/diet` | Diet & Nutrition | Barcode scanner, Bangladeshi food DB, AI recipe parser, dual quantity calculator |
| `/workout` | Workout Tracker | Session logging, exercise history, volume and PR tracking |
| `/progress` | Progress & Body Analytics | Longitudinal weight charts, 9-point body measurement modal, AI trajectory forecaster |
| `/analytics` | AI Health Intelligence | AI Health Score (0–100), Executive Coach briefing, Ask AI Coach Q&A, 7-day gameplan |
| `/profile` | Profile & Metabolism | BMI, BMR, TDEE, WHR, US Navy body fat %, AI metabolic & nutrient timing blueprint |
| `/settings` | Settings & Info | Theme preferences, application metadata, version information |

---

## 📜 Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches local development server |
| `npm run build` | Compiles production bundle and runs type validation |
| `npm run start` | Starts Node.js production server |
| `npm run lint` | Runs ESLint syntax and code quality checks |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

## 👤 Author & Credits

**N. I. Nazmul** — *ArtistyCode Studio*
- Website: [artistycode.studio](https://www.artistycode.studio/)
- GitHub: [@ninazmul](https://github.com/ninazmul)
- Email: [nazmulsaw@gmail.com](mailto:nazmulsaw@gmail.com)

<div align="center">
  <sub>Built with ❤️ for health and fitness enthusiasts worldwide.</sub>
</div>
