"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  Download,
  Info,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
  APP_NAME,
  APP_VERSION,
  APP_TAGLINE,
  APP_AUTHOR,
  APP_AUTHOR_URL,
  APP_LOGO,
  APP_LOGO_ALT,
} from "@/lib/constants";

const AdUnit = dynamic(() => import("@/components/shared/AdUnit"), {
  ssr: false,
});

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const handleExportData = () => {
    toast.success("Preparing CSV/JSON data export...");
    const dummyData = {
      app: APP_NAME,
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      status: "Success",
    };
    const blob = new Blob([JSON.stringify(dummyData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fitos-export-data.json";
    a.click();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">App Settings ⚙️</h1>
        <p className="text-xs text-muted-foreground">Customize preferences, theme, units, and export your data</p>
      </div>

      {/* Theme Preferences */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          Appearance & Theme
        </h2>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <button
            onClick={() => setTheme("light")}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === "light"
                ? "border-primary bg-primary/10 font-bold"
                : "border-border/40 hover:bg-accent"
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500" />
            Light Mode
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === "dark"
                ? "border-primary bg-primary/10 font-bold"
                : "border-border/40 hover:bg-accent"
            }`}
          >
            <Moon className="w-6 h-6 text-purple-500" />
            Dark Mode
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === "system"
                ? "border-primary bg-primary/10 font-bold"
                : "border-border/40 hover:bg-accent"
            }`}
          >
            <Laptop className="w-6 h-6 text-blue-500" />
            System Auto
          </button>
        </div>
      </div>

      {/* Ad between sections */}
      <AdUnit size="auto" label="Sponsored" maxWidth="728px" />

      {/* Unit Preferences */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Units System
        </h2>

        <div className="space-y-1 text-xs">
          <Label>Preferred Measurement Units</Label>
          <Select defaultValue="metric">
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric (Kilograms, Centimeters, Milliliters)</SelectItem>
              <SelectItem value="imperial">Imperial (Pounds, Inches, Fluid Ounces)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Export & Data Management */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-500" />
          Export & Privacy
        </h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 text-xs">
          <div>
            <p className="font-bold text-sm">Download My Data (JSON / CSV)</p>
            <p className="text-muted-foreground text-[11px]">Export complete workout, nutrition, and weight history</p>
          </div>
          <Button onClick={handleExportData} className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Export Data
          </Button>
        </div>
      </div>

      {/* About Application */}
      <div className="glass-card p-6 rounded-3xl border border-border/50 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-500" />
          About {APP_NAME}
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm">
              <Image
                src={APP_LOGO}
                alt={APP_LOGO_ALT}
                fill
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">{APP_NAME}</span>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
            </div>
          </div>

          <a
            href={APP_AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <span>Crafted by {APP_AUTHOR}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Footer Ad */}
      <AdUnit size="auto" maxWidth="728px" />
    </div>
  );
}
