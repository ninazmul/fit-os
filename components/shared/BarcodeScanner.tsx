"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ScanBarcode,
  Search,
  Camera,
  UtensilsCrossed,
  AlertCircle,
  X,
} from "lucide-react";
import type { IMealItem, MealType } from "@/types/fitness";
import { appendMealItem } from "@/lib/actions/meal.actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateStr?: string;
  defaultMealType?: MealType;
  onLogged?: () => void | Promise<void>;
}

interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  image?: string;
}

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue?: string }>>;
};

export default function BarcodeScanner({
  open,
  onOpenChange,
  dateStr,
  defaultMealType = "snack",
  onLogged,
}: BarcodeScannerProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const todayStr = dateStr || new Date().toISOString().split("T")[0];

  const handleLookupBarcode = useCallback(async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setProduct(null);

      const res = await fetch(
        `/api/barcode/product/${encodeURIComponent(cleanCode)}`,
        { cache: "no-store" },
      );
      const data = await res.json();

      if (!res.ok || !data.product) {
        setErrorMsg(
          data.error ||
            `No product found for barcode "${cleanCode}". Try searching manually.`,
        );
        throw new Error("Product not found");
      }

      setBarcodeInput(cleanCode);
      setProduct(data.product);
    } catch {
      setErrorMsg(
        (current) =>
          current || "Error connecting to Open Food Facts barcode database.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogScannedProduct = async () => {
    if (!product) return;

    try {
      setLoading(true);
      const item: IMealItem = {
        name: product.brand
          ? `${product.brand} - ${product.name}`
          : product.name,
        serving: product.servingSize,
        quantity,
        calories: product.calories * quantity,
        protein: product.protein * quantity,
        carbs: product.carbs * quantity,
        fat: product.fat * quantity,
        fiber: product.fiber * quantity,
      };

      await appendMealItem(todayStr, defaultMealType, item);

      toast.success(`Logged ${item.name} (${item.calories} kcal)! 📦`);
      onOpenChange(false);
      setProduct(null);
      setBarcodeInput("");
      await onLogged?.();
      router.refresh();
    } catch {
      toast.error("Failed to log scanned food");
    } finally {
      setLoading(false);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      cameraStreamRef.current = stream;
      setCameraStream(stream);
      setCameraOpen(true);
    } catch {
      setErrorMsg(
        "Camera permission denied or not available. Please use manual input.",
      );
      toast.error("Camera access denied");
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    setCameraStream(null);
    setCameraOpen(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const capturePhoto = async () => {
    if (!canvasRef.current || !videoRef.current) return;

    try {
      setErrorMsg(null);
      setLoading(true);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const width = video.videoWidth;
      const height = video.videoHeight;

      if (!width || !height) {
        setErrorMsg("Camera is still starting. Please try again in a moment.");
        return;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, width, height);

      const BarcodeDetector = (
        window as typeof window & {
          BarcodeDetector?: BarcodeDetectorConstructor;
        }
      ).BarcodeDetector;

      if (!BarcodeDetector) {
        setErrorMsg(
          "This browser does not support camera barcode detection yet. Please type the barcode manually.",
        );
        return;
      }

      const detector = new BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"],
      });
      const codes = await detector.detect(canvas);
      const detectedCode = codes[0]?.rawValue?.trim();

      if (!detectedCode) {
        setErrorMsg(
          "No barcode detected in the photo. Please center the barcode and try again.",
        );
        return;
      }

      stopCamera();
      await handleLookupBarcode(detectedCode);
    } catch {
      setErrorMsg(
        "Failed to detect barcode. Try typing it manually or use a clearer photo.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    const video = videoRef.current;
    if (!cameraOpen || !cameraStream || !video) return;

    video.srcObject = cameraStream;
    void video.play().catch(() => {
      setErrorMsg("Could not start the camera preview. Please try again.");
    });
  }, [cameraOpen, cameraStream]);

  // Close scanner when dialog closes
  useEffect(() => {
    if (!open) {
      stopCamera();
      setProduct(null);
      setBarcodeInput("");
    }
  }, [open, stopCamera]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-5 gap-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-primary" />
            Barcode Nutrition Scanner
          </DialogTitle>
        </DialogHeader>

        {/* Camera Mode */}
        {cameraOpen && (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <Button
                onClick={capturePhoto}
                className="rounded-full w-16 h-16 bg-white text-black shadow-lg"
              >
                <Camera className="w-7 h-7" />
              </Button>
              <Button
                variant="outline"
                onClick={stopCamera}
                className="rounded-full w-12 h-12 bg-white/90"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="absolute top-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
              Point camera at barcode
            </div>
          </div>
        )}

        {/* Manual Input */}
        {!cameraOpen && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              Enter or Scan Barcode
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. 8901030300001 (Milk, Biscuits, Juice...)"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLookupBarcode(barcodeInput);
                }}
                className="rounded-xl text-sm font-mono"
              />
              <Button
                disabled={loading || !barcodeInput.trim()}
                onClick={() => handleLookupBarcode(barcodeInput)}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
              >
                {loading ? "..." : <Search className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Powered by OpenFoodFacts global food database. Try barcode numbers
              on milk, oats, biscuits, or protein powders.
            </p>
          </div>
        )}

        {/* Camera Button */}
        {!cameraOpen && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => startCamera()}
              className="flex-1 rounded-xl border-dashed border-2 border-primary/30 hover:bg-primary/5 text-primary font-semibold"
            >
              <Camera className="w-4 h-4 mr-2" />
              Camera Scan
            </Button>
          </div>
        )}

        {/* Quick Test Barcodes */}
        <div className="space-y-1 pt-1">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Test Barcodes:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Oats", code: "3033710065067" },
              { label: "Nutella", code: "3017620422003" },
              { label: "Milk", code: "8712800000497" },
              { label: "KitKat", code: "5000159461122" },
            ].map((preset) => (
              <button
                key={preset.code}
                type="button"
                onClick={() => {
                  setBarcodeInput(preset.code);
                  handleLookupBarcode(preset.code);
                }}
                className="px-2.5 py-1 rounded-full bg-muted border border-border/50 text-[11px] font-medium hover:bg-accent transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Scanned product result card */}
        {product && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/20">
                  Found Product
                </span>
                <h4 className="text-base font-bold tracking-tight mt-1">
                  {product.name}
                </h4>
                {product.brand && (
                  <p className="text-xs text-muted-foreground">
                    {product.brand}
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {product.calories * quantity}
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  kcal total
                </span>
              </div>
            </div>

            {/* Macros breakdown */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-emerald-500/20 text-center text-xs">
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">Serving</p>
                <p className="font-bold">{product.servingSize}</p>
              </div>
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">Protein</p>
                <p className="font-bold text-emerald-600">
                  {product.protein * quantity}g
                </p>
              </div>
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">Carbs</p>
                <p className="font-bold text-blue-600">
                  {product.carbs * quantity}g
                </p>
              </div>
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">Fat</p>
                <p className="font-bold text-purple-600">
                  {product.fat * quantity}g
                </p>
              </div>
            </div>

            {/* Quantity control & Log button */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Servings:</Label>
                <div className="flex items-center gap-1">
                  {[0.5, 1, 2].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                        quantity === q
                          ? "bg-emerald-600 text-white"
                          : "bg-background border border-border text-muted-foreground"
                      }`}
                    >
                      {q}x
                    </button>
                  ))}
                </div>
              </div>

              <Button
                disabled={loading}
                onClick={handleLogScannedProduct}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Log to {defaultMealType}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
