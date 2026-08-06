import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { SEO_KEYWORDS, SITE_URL } from "@/lib/seo";

import "./globals.css";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
const ENABLE_ADSENSE =
    process.env.NODE_ENV === "production" && !!ADSENSE_CLIENT_ID;

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: "FitOS - Personal Fitness & Nutrition Tracker",
        template: "%s | FitOS",
    },

    description:
        "FitOS is a free fitness tracker with BMI, BMR, TDEE, body fat and ideal weight calculators, calorie counter, workout tracker and Bangladeshi food nutrition database.",

    keywords: SEO_KEYWORDS,

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
        locale: "en_BD",
        siteName: "FitOS",
        title: "FitOS - Free BMI Calculator, Calorie Counter & Fitness Tracker",
        description:
            "Calculate BMI, BMR, TDEE and body fat, then track calories, workouts, weight, water, sleep and body measurements in FitOS.",
        url: SITE_URL,
        images: [
            {
                url: "/assets/images/logo.png",
                width: 512,
                height: 512,
                alt: "FitOS",
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: "FitOS - Free BMI Calculator, Calorie Counter & Fitness Tracker",
        description:
            "Free fitness tracker with BMI, BMR, TDEE, body fat calculators, calorie counter and workout tracking.",
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
    authors: [{ name: "FitOS" }],
    creator: "FitOS",
    publisher: "FitOS",
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
