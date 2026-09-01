import type { Metadata } from "next";
import { APP_NAME, APP_SITE_URL } from "@/lib/constants";

export const SITE_URL = (
  APP_SITE_URL || "https://fitos.artistycode.studio"
).replace(/\/$/, "");

export const SITE_NAME = APP_NAME;

export const SEO_KEYWORDS = [
  "FitOS",
  "fitOs",
  "fitness tracker",
  "free fitness tracker",
  "BMI calculator",
  "BMR calculator",
  "TDEE calculator",
  "body fat calculator",
  "body fat percentage calculator",
  "ideal weight calculator",
  "calorie counter",
  "macro calculator",
  "nutrition tracker",
  "workout tracker",
  "water intake tracker",
  "Bangladeshi food calories",
  "Bangladeshi food nutrition database",
  "online fitness calculator",
  "PWA fitness app",
];

export const publicSeoPages = [
  {
    path: "/sign-in",
    title: "FitOS - Free BMI Calculator, Calorie Counter & Fitness Tracker",
    description:
      "Use FitOS for free BMI, BMR, TDEE, body fat and ideal weight calculators, plus a calorie counter, workout tracker and Bangladeshi food nutrition database.",
    priority: 1,
  },
  {
    path: "/fitness-calculator",
    title: "Free Fitness Calculator - BMI, BMR, TDEE & Body Fat | FitOS",
    description:
      "Calculate BMI, BMR, TDEE, body fat percentage and ideal weight online for free, then track calories, workouts, water, sleep and body measurements in FitOS.",
    priority: 0.95,
  },
  {
    path: "/bmi-calculator",
    title: "Free BMI Calculator Online - Body Mass Index | FitOS",
    description:
      "Calculate your BMI online using height and weight, see your BMI category, healthy BMI range and ideal weight estimate with FitOS.",
    priority: 0.9,
  },
  {
    path: "/bmr-calculator",
    title: "Free BMR Calculator - Basal Metabolic Rate | FitOS",
    description:
      "Estimate your basal metabolic rate with the Mifflin-St Jeor formula and use FitOS to turn BMR into daily calorie and macro targets.",
    priority: 0.9,
  },
  {
    path: "/tdee-calculator",
    title: "Free TDEE Calculator - Daily Calorie Needs | FitOS",
    description:
      "Calculate your total daily energy expenditure, maintenance calories, weight loss calories and weight gain calories with FitOS.",
    priority: 0.9,
  },
  {
    path: "/body-fat-calculator",
    title: "Free Body Fat Percentage Calculator | FitOS",
    description:
      "Estimate body fat percentage from body measurements using the U.S. Navy method and track body composition progress in FitOS.",
    priority: 0.9,
  },
] as const;

export function buildPublicPageMetadata(
  path: (typeof publicSeoPages)[number]["path"],
): Metadata {
  const page = publicSeoPages.find((item) => item.path === path);

  if (!page) {
    throw new Error(`Missing SEO config for ${path}`);
  }

  return {
    title: page.title,
    description: page.description,
    keywords: SEO_KEYWORDS,
    alternates: {
      canonical: path,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${path}`,
      siteName: SITE_NAME,
      title: page.title,
      description: page.description,
      images: [
        {
          url: "/assets/images/logo.png",
          width: 512,
          height: 512,
          alt: `${SITE_NAME} fitness tracker and calculators`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: ["/assets/images/logo.png"],
    },
  };
}
