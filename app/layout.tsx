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

export const metadata: Metadata = {
    title: {
        default: "FitOS – Personal Fitness & Nutrition Tracker",
        template: "%s | FitOS",
    },

    description:
        "FitOS is your all-in-one personal fitness companion. Track workouts, nutrition, weight, water, sleep, and body measurements with smart AI insights.",

    alternates: {
        canonical: "/",
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
        locale: "en_BD",
        siteName: "FitOS",
        title: "FitOS – Personal Fitness & Nutrition Tracker",
        description:
            "Track workouts, nutrition, weight, water, sleep, and body measurements with smart AI insights.",
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
        title: "FitOS – Personal Fitness & Nutrition Tracker",
        description:
            "Your all-in-one fitness companion for tracking nutrition, workouts, and body progress.",
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
