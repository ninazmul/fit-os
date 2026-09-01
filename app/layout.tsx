import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { SEO_KEYWORDS, SITE_URL } from "@/lib/seo";
import {
    APP_NAME,
    APP_SUBTAGLINE,
    APP_TAGLINE,
    APP_DESCRIPTION,
    APP_AUTHOR,
    APP_LOGO,
} from "@/lib/constants";

import "./globals.css";

const ADSENSE_CLIENT_ID =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1213821838926371";
const ENABLE_ADSENSE = !!ADSENSE_CLIENT_ID;

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `${APP_NAME} - ${APP_SUBTAGLINE}`,
        template: `%s | ${APP_NAME}`,
    },

    description: APP_DESCRIPTION,

    keywords: SEO_KEYWORDS,

    other: {
        "google-adsense-account": ADSENSE_CLIENT_ID,
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
        siteName: APP_NAME,
        title: `${APP_NAME} - ${APP_TAGLINE}`,
        description:
            "Calculate BMI, BMR, TDEE and body fat, then track calories, workouts, weight, water, sleep and body measurements.",
        url: SITE_URL,
        images: [
            {
                url: APP_LOGO,
                width: 512,
                height: 512,
                alt: APP_NAME,
            },
        ],
    },

    twitter: {
        card: "summary_large_image",
        title: `${APP_NAME} - ${APP_TAGLINE}`,
        description:
            "Free fitness tracker with BMI, BMR, TDEE, body fat calculators, calorie counter and workout tracking.",
        images: [APP_LOGO],
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
        title: APP_NAME,
        startupImage: ["/assets/icons/apple-touch-icon.png"],
    },

    formatDetection: {
        telephone: false,
        email: false,
        address: false,
    },

    applicationName: APP_NAME,
    authors: [{ name: APP_AUTHOR }],
    creator: APP_AUTHOR,
    publisher: APP_AUTHOR,
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
                        <script
                            async
                            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
                            crossOrigin="anonymous"
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
