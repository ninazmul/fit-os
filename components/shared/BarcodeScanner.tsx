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
  RotateCcw,
  UtensilsCrossed,
  AlertCircle,
  X,
  Loader2,
  ScanLine,
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

type FacingMode = "environment" | "user";

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => {
  detect: (
    source: CanvasImageSource
  ) => Promise<Array<{ rawValue?: string }>>;
};

/*
 * ---------------------------------------------------------
 * Module-level constants
 * (kept out of the component so they aren't re-created
 * on every render)
 * ---------------------------------------------------------
 */

const BARCODE_FORMATS = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "itf",
  "itf_14",
  "qr_code",
];

// Minimum time between detector.detect() calls. Running detection on
// every single animation frame (~60/s) burns battery/CPU for no real
// benefit — barcodes don't move that fast. ~8 scans/sec is plenty.
const SCAN_INTERVAL_MS = 120;

const QUICK_TEST_BARCODES = [
  { label: "Oats", code: "3033710065067" },
  { label: "Nutella", code: "3017620422003" },
  { label: "Milk", code: "8712800000497" },
  { label: "KitKat", code: "5000159461122" },
] as const;

const QUANTITY_PRESETS = [0.5, 1, 2] as const;

function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

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
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const detectorRef = useRef<InstanceType<BarcodeDetectorConstructor> | null>(
    null
  );

  const animationFrameRef = useRef<number | null>(null);
  const detectingRef = useRef(false);
  const detectedBarcodeRef = useRef<string | null>(null);
  const lastScanAtRef = useRef(0);

  // Cancels an in-flight lookup fetch if a new one starts, or the
  // dialog closes / unmounts while it's still pending.
  const lookupAbortRef = useRef<AbortController | null>(null);

  const router = useRouter();

  const todayStr = dateStr || new Date().toISOString().split("T")[0];

  /*
   * ---------------------------------------------------------
   * Barcode lookup
   * ---------------------------------------------------------
   */

  const handleLookupBarcode = useCallback(async (code: string) => {
    const cleanCode = code.trim();

    if (!cleanCode) return;

    lookupAbortRef.current?.abort();
    const controller = new AbortController();
    lookupAbortRef.current = controller;

    try {
      setLoading(true);
      setErrorMsg(null);
      setProduct(null);

      const res = await fetch(
        `/api/barcode/product/${encodeURIComponent(cleanCode)}`,
        {
          cache: "no-store",
          signal: controller.signal,
        }
      );

      const data = await res.json();

      if (!res.ok || !data.product) {
        setErrorMsg(
          data.error ||
          `No product found for barcode "${cleanCode}". Try searching manually.`
        );

        return;
      }

      setBarcodeInput(cleanCode);
      setProduct(data.product);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        // Superseded by a newer lookup — nothing to do.
        return;
      }

      setErrorMsg("Error connecting to Open Food Facts barcode database.");
    } finally {
      if (lookupAbortRef.current === controller) {
        setLoading(false);
        lookupAbortRef.current = null;
      }
    }
  }, []);

  /*
   * ---------------------------------------------------------
   * Log product
   * ---------------------------------------------------------
   */

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
      setQuantity(1);

      await onLogged?.();

      router.refresh();
    } catch {
      toast.error("Failed to log scanned food");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * Shared reset helper — cancels the scan loop and releases
   * the current stream/video without touching component state.
   * Used both when fully stopping the camera and right before
   * starting a new session (e.g. on flip).
   * ---------------------------------------------------------
   */

  const releaseCameraResources = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    detectingRef.current = false;

    stopMediaStream(cameraStreamRef.current);
    cameraStreamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    detectorRef.current = null;
  }, []);

  const stopCamera = useCallback(() => {
    releaseCameraResources();
    setCameraReady(false);
    setCameraOpen(false);
  }, [releaseCameraResources]);

  /*
   * ---------------------------------------------------------
   * Create BarcodeDetector
   * ---------------------------------------------------------
   */

  const createDetector = useCallback(() => {
    const BarcodeDetector = (
      window as typeof window & {
        BarcodeDetector?: BarcodeDetectorConstructor;
      }
    ).BarcodeDetector;

    if (!BarcodeDetector) {
      return null;
    }

    return new BarcodeDetector({ formats: BARCODE_FORMATS });
  }, []);

  /*
   * ---------------------------------------------------------
   * Continuous barcode scanning (throttled)
   * ---------------------------------------------------------
   */

  const scanFrame = useCallback(
    async (timestamp: number) => {
      const video = videoRef.current;
      const detector = detectorRef.current;

      if (!video || !detector) {
        return;
      }

      const dueForScan =
        timestamp - lastScanAtRef.current >= SCAN_INTERVAL_MS;

      const videoReady =
        video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA &&
        video.videoWidth > 0 &&
        video.videoHeight > 0;

      if (!dueForScan || detectingRef.current || !videoReady) {
        animationFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      lastScanAtRef.current = timestamp;
      detectingRef.current = true;

      try {
        const detectedCodes = await detector.detect(video);

        const detectedCode = detectedCodes
          .map((item) => item.rawValue?.trim())
          .find(Boolean);

        if (detectedCode && detectedBarcodeRef.current !== detectedCode) {
          detectedBarcodeRef.current = detectedCode;

          // Stop camera immediately after successful detection.
          stopCamera();

          await handleLookupBarcode(detectedCode);

          return;
        }
      } catch {
        /*
         * BarcodeDetector can occasionally fail on an individual
         * frame. We intentionally continue scanning instead of
         * killing the camera session.
         */
      } finally {
        detectingRef.current = false;
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    },
    [handleLookupBarcode, stopCamera]
  );

  /*
   * ---------------------------------------------------------
   * Start camera — always triggers the browser's permission
   * prompt via getUserMedia (unless already granted, in which
   * case the browser resolves immediately with no prompt; that
   * behavior is controlled by the browser, not this code).
   * ---------------------------------------------------------
   */

  const startCamera = useCallback(
    async (mode: FacingMode = facingMode) => {
      try {
        setErrorMsg(null);
        setProduct(null);
        setCameraReady(false);

        releaseCameraResources();
        detectedBarcodeRef.current = null;
        lastScanAtRef.current = 0;

        // -----------------------------------------
        // Check browser support
        // -----------------------------------------

        if (!navigator.mediaDevices) {
          setErrorMsg(
            "Camera access is unavailable. Please use HTTPS or localhost."
          );
          return;
        }

        if (!navigator.mediaDevices.getUserMedia) {
          setErrorMsg("Your browser does not support camera access.");
          return;
        }

        if (!window.isSecureContext) {
          setErrorMsg(
            "Camera access requires HTTPS. It works on localhost during development."
          );
          return;
        }

        const detector = createDetector();

        if (!detector) {
          setErrorMsg(
            "Automatic barcode scanning is not supported in this browser. Please enter the barcode manually."
          );
          return;
        }

        detectorRef.current = detector;

        // -----------------------------------------
        // Request camera permission — this is the one call
        // that actually surfaces the browser's permission UI.
        // We deliberately do NOT gate this behind a prior
        // permissions.query() check: some browsers report
        // stale/incorrect states there, and skipping straight
        // to getUserMedia guarantees the user is always asked
        // (or, if already granted, the stream just starts).
        // -----------------------------------------

        let stream: MediaStream;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
              aspectRatio: { ideal: 16 / 9 },
            },
            audio: false,
          });
        } catch (error) {
          console.error("getUserMedia error:", error);

          const cameraError =
            error instanceof DOMException ? error.name : "";

          const messages: Record<string, string> = {
            NotAllowedError:
              "Camera permission was denied. Please allow Camera access for this site in your browser settings, then try again.",
            NotFoundError: "No camera was found on this device.",
            NotReadableError:
              "The camera is already being used by another application.",
            SecurityError:
              "Camera access was blocked by the browser's security settings.",
          };

          setErrorMsg(
            messages[cameraError] ||
            "Unable to access the camera. Please check your browser permissions and try again."
          );

          return;
        }

        cameraStreamRef.current = stream;

        setFacingMode(mode);
        setCameraOpen(true);

        // -----------------------------------------
        // Attach stream to video
        // -----------------------------------------

        requestAnimationFrame(async () => {
          const video = videoRef.current;

          if (!video) {
            stopMediaStream(stream);
            cameraStreamRef.current = null;
            return;
          }

          try {
            video.srcObject = stream;

            await new Promise<void>((resolve) => {
              if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
                resolve();
                return;
              }

              const handleMetadata = () => {
                video.removeEventListener("loadedmetadata", handleMetadata);
                resolve();
              };

              video.addEventListener("loadedmetadata", handleMetadata);
            });

            await video.play();

            setCameraReady(true);

            if (animationFrameRef.current !== null) {
              cancelAnimationFrame(animationFrameRef.current);
            }

            animationFrameRef.current = requestAnimationFrame(scanFrame);
          } catch (error) {
            console.error("Video playback error:", error);

            stopMediaStream(stream);
            cameraStreamRef.current = null;

            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.srcObject = null;
            }

            setCameraReady(false);
            setErrorMsg("Could not start the camera preview. Please try again.");
          }
        });
      } catch (error) {
        console.error("Camera initialization error:", error);

        setCameraReady(false);
        setErrorMsg("Unable to initialize the camera. Please check your browser permissions.");
      }
    },
    [createDetector, facingMode, releaseCameraResources, scanFrame]
  );

  /*
   * ---------------------------------------------------------
   * Flip camera
   * ---------------------------------------------------------
   */

  const flipCamera = useCallback(async () => {
    const nextMode: FacingMode =
      facingMode === "environment" ? "user" : "environment";

    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  const openCameraScanner = useCallback(async () => {
    detectedBarcodeRef.current = null;
    await startCamera("environment");
  }, [startCamera]);

  /*
   * ---------------------------------------------------------
   * Always ask for camera permission as soon as the dialog
   * opens, instead of waiting for the user to tap a button.
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (open) {
      openCameraScanner();
    }
    // Intentionally only re-run when `open` flips — not when
    // openCameraScanner's identity changes — so we don't restart
    // the camera on every unrelated re-render while the dialog
    // is already open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /*
   * ---------------------------------------------------------
   * Cleanup on unmount
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      releaseCameraResources();
      lookupAbortRef.current?.abort();
    };
  }, [releaseCameraResources]);

  /*
   * Close scanner when dialog closes.
   */

  useEffect(() => {
    if (!open) {
      stopCamera();
      lookupAbortRef.current?.abort();

      setProduct(null);
      setBarcodeInput("");
      setQuantity(1);
      setErrorMsg(null);

      detectedBarcodeRef.current = null;
    }
  }, [open, stopCamera]);

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-5 gap-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-primary" />
            Barcode Nutrition Scanner
          </DialogTitle>
        </DialogHeader>

        {/* =====================================================
            CONTINUOUS CAMERA SCANNER
        ===================================================== */}

        {cameraOpen && (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-3xl bg-black aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 top-0 h-[25%] bg-black/45" />
                <div className="absolute inset-x-0 bottom-0 h-[25%] bg-black/45" />
                <div className="absolute left-0 top-[25%] bottom-[25%] w-[12%] bg-black/45" />
                <div className="absolute right-0 top-[25%] bottom-[25%] w-[12%] bg-black/45" />

                <div className="absolute left-[12%] right-[12%] top-[25%] bottom-[25%]">
                  <span className="absolute left-0 top-0 w-8 h-8 border-l-[3px] border-t-[3px] border-white rounded-tl-xl" />
                  <span className="absolute right-0 top-0 w-8 h-8 border-r-[3px] border-t-[3px] border-white rounded-tr-xl" />
                  <span className="absolute left-0 bottom-0 w-8 h-8 border-l-[3px] border-b-[3px] border-white rounded-bl-xl" />
                  <span className="absolute right-0 bottom-0 w-8 h-8 border-r-[3px] border-b-[3px] border-white rounded-br-xl" />

                  {cameraReady && (
                    <div className="absolute left-2 right-2 top-1/2 h-[2px] bg-primary shadow-[0_0_12px_hsl(var(--primary))] animate-pulse" />
                  )}
                </div>
              </div>

              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-2 rounded-full bg-black/65 backdrop-blur-sm px-3 py-1.5 text-white text-xs font-medium whitespace-nowrap">
                  {cameraReady ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      Scan barcode
                    </>
                  ) : (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Starting camera...
                    </>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={flipCamera}
                disabled={!cameraReady}
                className="absolute top-3 right-3 rounded-full w-11 h-11 bg-black/65 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
                aria-label="Flip camera"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                className="absolute bottom-3 right-3 rounded-full w-11 h-11 bg-white/90 hover:bg-white text-black border-0"
                aria-label="Close camera"
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2 rounded-full bg-black/65 backdrop-blur-sm px-3 py-1.5 text-white text-[11px]">
                  <ScanLine className="w-3.5 h-3.5" />
                  {facingMode === "environment" ? "Rear camera" : "Front camera"}
                </div>
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-foreground">
              Align the barcode inside the frame. It will scan automatically.
            </p>
          </div>
        )}

        {/* =====================================================
            MANUAL INPUT
        ===================================================== */}

        {!cameraOpen && (
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              Enter Barcode Manually
            </Label>

            <div className="flex gap-2">
              <Input
                placeholder="e.g. 8901030300001"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLookupBarcode(barcodeInput);
                  }
                }}
                className="rounded-xl text-sm font-mono"
              />

              <Button
                disabled={loading || !barcodeInput.trim()}
                onClick={() => handleLookupBarcode(barcodeInput)}
                className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Search products using their barcode number.
            </p>
          </div>
        )}

        {/* =====================================================
            CAMERA BUTTON (retry / reopen)
        ===================================================== */}

        {!cameraOpen && (
          <Button
            type="button"
            onClick={openCameraScanner}
            disabled={loading}
            className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-white font-bold"
          >
            <Camera className="w-5 h-5 mr-2" />
            Scan with Camera
          </Button>
        )}

        {/* =====================================================
            QUICK TEST BARCODES
        ===================================================== */}

        {!cameraOpen && (
          <div className="space-y-1 pt-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Test Barcodes:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {QUICK_TEST_BARCODES.map((preset) => (
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
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* =====================================================
            PRODUCT RESULT
        ===================================================== */}

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
                  <p className="text-xs text-muted-foreground">{product.brand}</p>
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

            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">Servings:</Label>

                <div className="flex items-center gap-1">
                  {QUANTITY_PRESETS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantity(q)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${quantity === q
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
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                )}
                Log to {defaultMealType}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}