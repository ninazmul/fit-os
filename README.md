<div align="center">

# 🌐 NutriBD

### AI-Powered Fitness, Nutrition & Health Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

_A comprehensive, AI-driven personal fitness & nutrition platform for Bangladesh and worldwide. Track meals, workouts, weight, water, sleep, and 9-point body measurements with real-time Google Gemini AI coaching, natural language culinary recipe estimation, barcode scanning, and goal trajectory forecasting._

[Live Demo](https://nutribd.com) · [Report Bug](https://github.com/ninazmul/fit-os/issues) · [Request Feature](https://github.com/ninazmul/fit-os/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features & Functional Breakdown](#-key-features--functional-breakdown)
  - [🤖 AI Health Intelligence Engine](#-ai-health-intelligence-engine-gemini-ai)
  - [🍽️ Diet & Nutrition Tracker](#-diet--nutrition-tracker)
  - [💪 Workout & Training Tracker](#-workout--training-tracker)
  - [📈 Progress, Body Analytics & Recomposition](#-progress-body-analytics--recomposition)
  - [💤 Sleep & Recovery Tracker](#-sleep--recovery-tracker)
  - [💧 Hydration Tracker](#-hydration-tracker)
  - [👤 Profile & Biometric Engine](#-profile--biometric-engine)
- [System Architecture](#-system-architecture)
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

---

## ✨ Key Features & Functional Breakdown

### 🤖 AI Health Intelligence Engine (Gemini AI)

- **AI Health & Performance Score (0–100):** Multi-dimensional score evaluating Nutrition (35%), Workouts (25%), Recovery (20%), and Hydration (20%) with performance grade and component sub-rings.
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
- **Consistency Monitor:** Weekly workout frequency counter against profile targets with recovery pacing.

### 📈 Progress, Body Analytics & Recomposition

- **AI Goal Trajectory Forecaster:** Predicts target weight arrival date based on actual weight delta velocity, deficit/surplus, and plateau detection.
- **AI Body Recomposition Matrix:** Evaluates 9-point circumference delta against scale weight to assess muscle retention vs. fat loss.
- **9-Point Body Measurement Modal:** Logs Chest, Waist, Hips, Shoulders, Neck, Arm (Bicep), Forearm, Thigh, and Calf with date selector defaulting to today and historical delta badges.
- **Longitudinal Weight Charts:** 7, 30, and 60-day interactive area charts with moving averages.

### 💤 Sleep & Recovery Tracker

- **Sleep Session Tracker:** Log bedtime, wake time, duration (including overnight split calculation), and 1–5 star sleep quality.
- **AI Recovery Index:** Evaluates sleep trends to output readiness scores (*Peak Performance*, *Optimal Recovery*, *Moderate Fatigue*) and training advice.

### 💧 Hydration Tracker

- **Hydration Logging:** Quick-log water presets (+250ml, +500ml) with daily target rings and morning hydration protocols.

### 👤 Profile & Biometric Engine

- **Biometric Calculators:**
  - **BMI** (Body Mass Index) & Classification
  - **BMR** (Mifflin-St Jeor) & **TDEE** (Activity Multipliers)
  - **Ideal Weight Range** (Hamwi formula)
  - **US Navy Body Fat %** & Lean Body Mass
  - **WHR** (Waist-to-Hip) & **WHtR** (Waist-to-Height) cardiovascular risk profiling
- **AI Profile Assessment:** Customized metabolic profile, pre/post-workout nutrient timing blueprint, training split recommendations, and longevity roadmap.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Next.js 15 Client - React 19] -->|Server Actions| AppRouter[Next.js App Router]

    subgraph Authentication & Security
        Clerk[Clerk Auth] -->|JWT Session| AppRouter
    end

    subgraph AI Intelligence Layer
        AppRouter -->|Gemini 1.5 / 2.0 Flash| GeminiAPI[Google Gemini API]
        AppRouter -->|Deterministic Rule Engine| FallbackEngine[Culinary & Metabolic Engine]
    end

    subgraph Core Server Actions
        AppRouter --> AIAnalytics[ai-analytics.actions.ts]
        AppRouter --> AIProgress[ai-progress.actions.ts]
        AppRouter --> AIProfile[ai-profile.actions.ts]
        AppRouter --> AIFood[ai-food.actions.ts]
        AppRouter --> MealActions[meal.actions.ts]
        AppRouter --> WorkoutActions[workout.actions.ts]
        AppRouter --> WeightActions[weight.actions.ts]
        AppRouter --> WaterSleep[water-sleep.actions.ts]
        AppRouter --> BodyMeas[body-measurement.actions.ts]
    end

    subgraph Database Layer
        AIAnalytics & MealActions & WorkoutActions & WeightActions --> MongoDB[(MongoDB / Mongoose 8)]
        MongoDB --> UserProfileModel[UserProfile Model]
        MongoDB --> MealLogModel[MealLog Model]
        MongoDB --> WorkoutLogModel[WorkoutLog Model]
        MongoDB --> WeightLogModel[WeightLog Model]
        MongoDB --> SleepLogModel[SleepLog Model]
        MongoDB --> WaterLogModel[WaterLog Model]
        MongoDB --> BodyMeasModel[BodyMeasurement Model]
    end
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) | App Router, Server Actions & React Server Components |
| **UI Library** | [React 19](https://react.dev/) | Client components, hooks, and responsive state |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | 100% strict type safety across client and server |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Glassmorphism design system & dark mode tokens |
| **AI Engine** | [Google Gemini AI](https://ai.google.dev/) | Gemini 1.5 Flash natural language & predictive analysis |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose 8](https://mongoosejs.com/) | Cloud document database with indexed schemas |
| **Authentication** | [Clerk Auth](https://clerk.com/) | Passwordless, OAuth & secure multi-tenant user management |
| **Charts & Viz** | [Recharts](https://recharts.org/) | Responsive SVG charts for weight, sleep, and macro trends |
| **Barcode Scanner** | `@zxing/browser` | Camera-based barcode recognition |
| **Validations** | `zod` | Client & server schema validation |

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.17.0` or higher (Node v20+ recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB**: A running local MongoDB instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.
- **Clerk Account**: Free account on [Clerk.com](https://clerk.com) for authentication keys.
- **Google Gemini API Key** *(Optional for AI features)*: Obtain from [Google AI Studio](https://aistudio.google.com/).

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ninazmul/fit-os.git
   cd fit-os
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Route Redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitos?retryWrites=true&w=majority

# Google Gemini AI API Key (Optional — deterministic fallback active if omitted)
GEMINI_API_KEY=AIzaSy...

# Public Site URL
NEXT_PUBLIC_SITE_URL=https://fitos.artistycode.studio
```

---

### Running the Application

1. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🔑 Environment Variables

| Variable | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | String | Yes | Clerk public API key |
| `CLERK_SECRET_KEY` | String | Yes | Clerk secret key for token validation |
| `MONGODB_URI` | String | Yes | MongoDB connection string |
| `GEMINI_API_KEY` | String | No | Google Gemini API key for AI features |
| `NEXT_PUBLIC_SITE_URL` | String | No | Canonical site URL for SEO metadata |

---

## 📁 Project Structure

```text
fit-os/
├── app/
│   ├── (auth)/              # Public Clerk authentication routes (sign-in, sign-up)
│   ├── (root)/              # Core authenticated application modules
│   │   ├── diet/            # Meal logging, food DB, barcode scanner, recipe AI
│   │   ├── workout/         # Workout logging & exercise history
│   │   ├── progress/        # Weight charts, body measurements & AI trajectory
│   │   ├── analytics/       # AI Health Score, Executive Coach & Ask AI Coach
│   │   ├── profile/         # Health profile, BMI/BMR/TDEE & AI metabolic audit
│   │   ├── settings/        # App preferences & About card
│   │   └── page.tsx         # Real-time Daily Dashboard
│   ├── api/                 # API endpoints
│   ├── globals.css          # Tailwind CSS design system tokens & glassmorphism
│   └── layout.tsx           # Root layout with ClerkProvider, themes & metadata
├── components/
│   ├── navigation/          # Navbar, DesktopSidebar, NavigationSheet
│   ├── shared/              # StatCard, BarcodeScanner, BodyMeasurementModal, QuickAdd
│   └── ui/                  # Radix UI primitives (Button, Dialog, Tabs, etc.)
├── lib/
│   ├── actions/             # Next.js Server Actions (AI, meals, workouts, weights)
│   │   ├── ai-analytics.actions.ts  # Health Score, executive briefing, Ask AI Coach
│   │   ├── ai-progress.actions.ts   # Trajectory forecasting & recomposition
│   │   ├── ai-profile.actions.ts    # Metabolic profiling & longevity roadmap
│   │   ├── ai-food.actions.ts       # Natural language recipe parser & macro calculator
│   │   └── ...                      # Core database CRUD actions
│   ├── database/            # Mongoose models & database connection
│   ├── constants.ts         # Centralized branding, versioning & global config
│   ├── food-portion.ts      # Dual-mode portion & gram quantity calculator
│   └── utils.ts             # Date formatting & timezone midnight synchronization
├── types/                   # Global TypeScript definitions
└── package.json             # Project dependencies & scripts
```

---

## 🗄️ Database Models

| Model | Description | Key Fields |
| :--- | :--- | :--- |
| **`UserProfile`** | Core user biometrics & goals | `clerkId`, `age`, `gender`, `height`, `currentWeight`, `targetWeight`, `goal`, `activityLevel`, `dailyCaloriesGoal`, `dailyProteinGoal`, `waterGoalMl`, `workoutDaysPerWeek` |
| **`MealLog`** | Daily nutrition logs | `clerkId`, `date`, `mealType`, `items` (`name`, `calories`, `protein`, `carbs`, `fat`, `fiber`, `quantity`, `portionEaten`), `totalCalories`, `totalProtein`, `totalCarbs`, `totalFat` |
| **`WorkoutLog`** | Training sessions | `clerkId`, `date`, `title`, `workoutType`, `durationMinutes`, `caloriesBurned`, `exercises` (`name`, `sets`, `reps`, `weightKg`) |
| **`WeightLog`** | Daily scale entries | `clerkId`, `date`, `weight`, `notes` |
| **`BodyMeasurement`** | 9-point circumference logs | `clerkId`, `date`, `waist`, `chest`, `hip`, `neck`, `shoulder`, `arm`, `forearm`, `thigh`, `calf` |
| **`SleepLog`** | Sleep & recovery sessions | `clerkId`, `date`, `totalHours`, `sessions` (`sleepTime`, `wakeTime`, `totalHours`, `quality`, `notes`) |
| **`WaterLog`** | Daily hydration records | `clerkId`, `date`, `totalMl`, `entries` (`amountMl`, `timestamp`) |
| **`SavedMeal`** | User-saved meal presets | `clerkId`, `name`, `mealType`, `items`, `totalCalories`, `totalProtein`, `totalCarbs`, `totalFat` |

---

## 🗺️ Main Application Routes

| Route | Purpose | Key Features |
| :--- | :--- | :--- |
| `/` | Daily Dashboard | Quick log, calorie/macro rings, water progress, workout summary |
| `/diet` | Diet & Nutrition | Barcode scanner, Bangladeshi food DB, AI recipe parser, dual quantity calculator |
| `/workout` | Workout Tracker | Session logging, exercise history, volume and calorie burn tracking |
| `/progress` | Progress & Body Analytics | Longitudinal weight charts, 9-point body measurement modal, AI trajectory forecaster |
| `/analytics` | AI Health Intelligence | AI Health Score (0–100), Executive Coach briefing, Ask AI Coach Q&A, 7-day gameplan |
| `/profile` | Profile & Metabolism | BMI, BMR, TDEE, WHR, US Navy body fat %, AI metabolic & nutrient timing blueprint |
| `/settings` | Settings & Info | Theme preferences, application metadata, version information |

---

## 📜 Scripts Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Launches local development server with Turbopack |
| `npm run build` | Compiles production bundle and runs type validation |
| `npm run start` | Starts Node.js production server |
| `npm run lint` | Runs ESLint syntax and code quality checks |
| `npx tsc --noEmit` | Runs dry-run TypeScript compiler check |

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
