import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

import "./globals.css";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const ENABLE_ADSENSE =
  process.env.NODE_ENV === "production" && !!ADSENSE_CLIENT_ID;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fit-os.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "FitOS – Free BMI Calculator, Calorie Counter & Fitness Tracker | Bangladeshi Food Database",
    template: "%s | FitOS – Fitness & Nutrition Tracker",
  },

  description:
    "FitOS is a free online fitness tracker with BMI calculator, BMR calculator, TDEE calculator, body fat percentage calculator, calorie counter, workout logger, and 100+ Bangladeshi food nutrition database. Track macros, water intake, weight, and body measurements with AI-powered insights. Works offline as a PWA.",

  keywords: [
    "BMI calculator",
    "BMR calculator",
    "TDEE calculator",
    "body fat percentage calculator",
    "calorie counter",
    "calorie tracker",
    "fitness tracker",
    "nutrition tracker",
    "macro calculator",
    "Bangladeshi food calories",
    "Bengali food nutrition",
    "workout tracker",
    "weight tracker",
    "body measurement tracker",
    "water intake tracker",
    "protein tracker",
    "diet planner",
    "Kacchi Biryani calories",
    "Polao calories",
    "Ilish fish calories",
    "daily calorie calculator",
    "ideal weight calculator",
    "free fitness app",
    "PWA fitness app",
    "online BMI calculator metric",
    "Mifflin-St Jeor calculator",
    "U.S. Navy body fat calculator",
    "health tracker app",
    "muscle gain diet plan",
    "weight loss calorie deficit",
    "FitOS",
  ],

  alternates: {
    canonical: "/",
  },

  category: "Health & Fitness",

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
    locale: "en_US",
    url: SITE_URL,
    siteName: "FitOS",
    title:
      "FitOS – Free BMI Calculator, Calorie Counter & Fitness Tracker",
    description:
      "Free online BMI, BMR, TDEE & body fat calculators. Track workouts, nutrition, Bangladeshi foods, water intake, and body measurements with AI insights.",
    images: [
      {
        url: "/assets/images/logo.png",
        width: 512,
        height: 512,
        alt: "FitOS – Free Fitness & Nutrition Tracker with BMI Calculator",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "FitOS – Free BMI Calculator, Calorie Counter & Fitness Tracker",
    description:
      "Free online fitness calculators (BMI, BMR, TDEE, Body Fat %). Track Bangladeshi & global meals, workouts, weight, and body metrics.",
    images: ["/assets/images/logo.png"],
  },

  icons: {
    icon: [
      { url: "/assets/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      {
        url: "/assets/icons/favicon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/assets/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/assets/icons/icon-512.png",
        color: "#22a065",
      },
    ],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitOS",
    startupImage: ["/assets/icons/apple-touch-icon.png"],
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  applicationName: "FitOS",
  authors: [{ name: "ArtistyCode Studio", url: "https://www.artistycode.studio/" }],
  creator: "ArtistyCode Studio",
  publisher: "ArtistyCode Studio",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {ENABLE_ADSENSE && (
            <Script
              id="adsense-auto-ads"
              async
              strategy="afterInteractive"
              crossOrigin="anonymous"
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            />
          )}
        </head>
        <body
          className={`${inter.variable} font-sans antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
