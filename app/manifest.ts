import type { MetadataRoute } from "next";
import { APP_NAME, APP_TAGLINE, APP_DESCRIPTION } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} - ${APP_TAGLINE}`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/sign-in",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["health", "fitness", "lifestyle", "productivity"],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: "Fitness Calculators",
        short_name: "Calculators",
        description: "Open FitOS BMI, BMR, TDEE and body fat calculators",
        url: "/fitness-calculator",
        icons: [
          {
            src: "/assets/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Quick Log Water",
        short_name: "Log Water",
        description: "Quickly log water intake",
        url: "/",
        icons: [
          {
            src: "/assets/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Log a Meal",
        short_name: "New Meal",
        description: "Track your meal and nutrition",
        url: "/diet",
        icons: [
          {
            src: "/assets/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Start Workout",
        short_name: "Workout",
        description: "Begin a new workout session",
        url: "/workout",
        icons: [
          {
            src: "/assets/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    icons: [
      {
        src: "/assets/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/assets/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/assets/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/assets/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/assets/images/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
