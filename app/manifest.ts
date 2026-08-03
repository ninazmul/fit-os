import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FitOS – Personal Fitness & Nutrition Tracker",
    short_name: "FitOS",
    description:
      "FitOS is your all-in-one personal fitness companion. Track workouts, nutrition, weight, water, sleep, and body measurements with smart AI insights.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f5f7fa",
    theme_color: "#22a065",
    categories: ["health", "fitness", "lifestyle", "productivity"],
    prefer_related_applications: false,
    shortcuts: [
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
