"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  X,
  Smartphone,
  Sparkles,
  Share2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const INSTALLED_KEY = "fitos-pwa-installed";

export default function AddToHomeScreenPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [iosHintOpen, setIosHintOpen] = useState(false);

  const shouldShowBanner = useCallback(() => {
    if (typeof window === "undefined") return false;
    const installed = localStorage.getItem(INSTALLED_KEY);
    if (installed) return false;
    return true;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error - iOS Safari proprietary property
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const runningOnIOS =
      /iphone|ipad|ipod/.test(ua) && !/crios|fxios|edgios/.test(ua);
    setIsIOS(runningOnIOS);

    if (standalone) {
      localStorage.setItem(INSTALLED_KEY, "1");
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (shouldShowBanner()) setVisible(true);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, "1");
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if (shouldShowBanner()) {
      setVisible(true);
    }

    if (!deferredPrompt && runningOnIOS && shouldShowBanner()) {
      const safariOnly = /safari/.test(ua);
      if (safariOnly) {
        const timer = setTimeout(() => setVisible(true), 2500);
        return () => {
          clearTimeout(timer);
          window.removeEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
          );
          window.removeEventListener("appinstalled", handleAppInstalled);
        };
      }
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [deferredPrompt, shouldShowBanner]);

  const handleInstall = async () => {
    if (isIOS) {
      setIosHintOpen(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult?.outcome === "accepted") {
      localStorage.setItem(INSTALLED_KEY, "1");
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!visible || isStandalone) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed z-[90] bottom-[84px] left-3 right-3 md:hidden"
        >
          <div className="relative rounded-3xl border border-border/70 bg-gradient-to-br from-primary/15 via-card to-blue-500/10 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-4 overflow-hidden">
            <div className="orb-primary pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl" />
            <div className="orb-blue-soft pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full blur-3xl" />

            <div className="relative flex items-start gap-3 pr-8">
              <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-emerald-500 shadow-lg border border-primary/20">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">
                    Install FitOS App
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {isIOS
                    ? "Add FitOS to your Home Screen for quick access, offline use, and a full-screen app experience."
                    : "Install FitOS on your device for one-tap access, offline support, and a native-like experience."}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    {isIOS ? "How to Install" : "Install App"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {isIOS && iosHintOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8"
          onClick={() => setIosHintOpen(false)}
        >
          <motion.div
            initial={{ y: 60, scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-border/70 bg-card shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/90 to-emerald-500 shadow-lg border border-primary/20">
                  <Share2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Install on iOS</h3>
                  <p className="text-xs text-muted-foreground">
                    Follow these quick steps
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIosHintOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  step: 1,
                  label: "Tap the Share button",
                  icon: Share2,
                },
                {
                  step: 2,
                  label: "Scroll down and tap 'Add to Home Screen'",
                  icon: Smartphone,
                },
                {
                  step: 3,
                  label: "Tap 'Add' in the top right corner",
                  icon: ChevronRight,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 border border-border/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary flex-shrink-0 font-bold">
                      {item.step}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs font-medium text-foreground">
                        {item.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => setIosHintOpen(false)}
              className="w-full rounded-xl text-sm font-bold bg-primary hover:bg-primary/90"
            >
              Got it
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
