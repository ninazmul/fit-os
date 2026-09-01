/**
 * Application Branding, Versioning & Global Constants
 * Update values here to reflect across the entire NutriBD application.
 */

export const APP_CONFIG = {
  name: "NutriBD",
  version: "v2.2.1",
  versionRaw: "2.2.1",
  tagline: "Smart AI Fitness & Nutrition Platform",
  subTagline: "AI-Powered Nutrition & Health Intelligence for Bangladesh",
  description:
    "NutriBD is an AI-powered fitness and nutrition platform with Google Gemini AI coaching, BMI, BMR, TDEE, body fat calculators, calorie counter, workout tracker and Bangladeshi food database.",
  author: {
    name: "ArtistyCode Studio",
    url: "https://www.artistycode.studio/",
  },
  links: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://nutribd.com",
    authorUrl: "https://www.artistycode.studio/",
    github: "https://github.com/ninazmul/nutribd",
  },
  assets: {
    logo: "/assets/images/logo.png",
    logoAlt: "NutriBD Logo – Smart AI Fitness & Nutrition Platform",
    favicon192: "/assets/icons/icon-192.png",
    favicon512: "/assets/icons/icon-512.png",
    appleTouchIcon: "/assets/icons/apple-touch-icon.png",
  },
  brandPills: {
    badge: "v2.2.1",
    bdBadge: "BD",
    customBadge: "Custom",
  },
} as const;

// Convenient direct exports
export const APP_NAME = APP_CONFIG.name;
export const APP_VERSION = APP_CONFIG.version;
export const APP_VERSION_RAW = APP_CONFIG.versionRaw;
export const APP_TAGLINE = APP_CONFIG.tagline;
export const APP_SUBTAGLINE = APP_CONFIG.subTagline;
export const APP_DESCRIPTION = APP_CONFIG.description;
export const APP_AUTHOR = APP_CONFIG.author.name;
export const APP_AUTHOR_URL = APP_CONFIG.author.url;
export const APP_SITE_URL = APP_CONFIG.links.siteUrl;
export const APP_LOGO = APP_CONFIG.assets.logo;
export const APP_LOGO_ALT = APP_CONFIG.assets.logoAlt;
