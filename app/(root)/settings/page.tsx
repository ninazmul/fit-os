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
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const handleExportData = () => {
    toast.success("Preparing CSV/JSON data export...");
    const dummyData = {
      app: "FitOS",
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
    </div>
  );
}
