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
  ChefHat,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import type { MealType } from "@/types/fitness";
import { createCustomFood } from "@/lib/actions/food.actions";
import type { FoodFormValues } from "@/validations/fitness";
import { getLocalDateString } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { notifyDataUpdated } from "@/lib/events";

interface BarcodeScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateStr?: string;
  defaultMealType?: MealType;
  onLogged?: () => void | Promise<void>;
  onCustomFoodSaved?: (food: any) => void | Promise<void>;
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

const FOOD_CATEGORIES: { value: FoodFormValues["category"]; label: string }[] = [
  { value: "snacks_beverages", label: "Snacks & Beverages 🥤" },
  { value: "dairy_eggs", label: "Dairy & Eggs 🥛" },
  { value: "bread_bakery", label: "Bread & Bakery 🍞" },
  { value: "rice_grains", label: "Rice & Grains 🍚" },
  { value: "fruits_veg", label: "Fruits & Vegetables 🍎" },
  { value: "curry_meat", label: "Curry & Meat 🍗" },
  { value: "fish_seafood", label: "Fish & Seafood 🐟" },
  { value: "sweets_desserts", label: "Sweets & Desserts 🍯" },
  { value: "custom", label: "Other / Custom 🍽️" },
];

function inferCategory(name: string): FoodFormValues["category"] {
  const lower = name.toLowerCase();
  if (
    lower.includes("milk") ||
    lower.includes("cheese") ||
    lower.includes("yogurt") ||
    lower.includes("curd") ||
    lower.includes("egg") ||
    lower.includes("butter") ||
    lower.includes("ghee") ||
    lower.includes("dairy")
  ) {
    return "dairy_eggs";
  }
  if (
    lower.includes("bread") ||
    lower.includes("bun") ||
    lower.includes("biscuit") ||
    lower.includes("cookie") ||
    lower.includes("cake") ||
    lower.includes("bakery") ||
    lower.includes("toast") ||
    lower.includes("roti")
  ) {
    return "bread_bakery";
  }
  if (
    lower.includes("rice") ||
    lower.includes("oat") ||
    lower.includes("cereal") ||
    lower.includes("grain") ||
    lower.includes("flour") ||
    lower.includes("pasta") ||
    lower.includes("noodle") ||
    lower.includes("muesli") ||
    lower.includes("quinoa")
  ) {
    return "rice_grains";
  }
  if (
    lower.includes("juice") ||
    lower.includes("drink") ||
    lower.includes("tea") ||
    lower.includes("coffee") ||
    lower.includes("chips") ||
    lower.includes("snack") ||
    lower.includes("soda") ||
    lower.includes("water") ||
    lower.includes("chocolate") ||
    lower.includes("bar") ||
    lower.includes("crisp")
  ) {
    return "snacks_beverages";
  }
  if (
    lower.includes("fruit") ||
    lower.includes("apple") ||
    lower.includes("banana") ||
    lower.includes("veg") ||
    lower.includes("salad") ||
    lower.includes("tomato") ||
    lower.includes("berry")
  ) {
    return "fruits_veg";
  }
  if (
    lower.includes("fish") ||
    lower.includes("prawn") ||
    lower.includes("shrimp") ||
    lower.includes("salmon") ||
    lower.includes("tuna") ||
    lower.includes("seafood")
  ) {
    return "fish_seafood";
  }
  if (
    lower.includes("meat") ||
    lower.includes("chicken") ||
    lower.includes("beef") ||
    lower.includes("mutton") ||
    lower.includes("curry") ||
    lower.includes("pork") ||
    lower.includes("steak")
  ) {
    return "curry_meat";
  }
  if (
    lower.includes("sweet") ||
    lower.includes("halwa") ||
    lower.includes("mithai") ||
    lower.includes("dessert") ||
    lower.includes("ice cream") ||
    lower.includes("candy") ||
    lower.includes("sugar") ||
    lower.includes("honey")
  ) {
    return "sweets_desserts";
  }
  return "snacks_beverages";
}

function stopMediaStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

/*
 * Checks whether the device actually has a camera before we ever
 * try to request permission for one. Without this, a machine with
 * no camera hardware at all still runs through getUserMedia and
 * (depending on the browser) can surface a generic init error
 * instead of a clear "no camera" message.
 *
 * Returns `null` when the check itself isn't supported, so callers
 * can fall back to just attempting getUserMedia as before.
 */
async function deviceHasCamera(): Promise<boolean | null> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return null;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === "videoinput");
  } catch {
    return null;
  }
}

export default function BarcodeScanner({
  open,
  onOpenChange,
  dateStr,
  defaultMealType = "snack",
  onLogged,
  onCustomFoodSaved,
}: BarcodeScannerProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable custom food states
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] =
    useState<FoodFormValues["category"]>("snacks_beverages");
  const [editServingSize, setEditServingSize] = useState("100g");
  const [editCalories, setEditCalories] = useState<number>(0);
  const [editProtein, setEditProtein] = useState<number>(0);
  const [editCarbs, setEditCarbs] = useState<number>(0);
  const [editFat, setEditFat] = useState<number>(0);
  const [editFiber, setEditFiber] = useState<number>(0);
  const [savingCustom, setSavingCustom] = useState(false);

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

  const resetScannerState = useCallback(() => {
    setProduct(null);
    setBarcodeInput("");
    setEditName("");
    setEditCategory("snacks_beverages");
    setEditServingSize("100g");
    setEditCalories(0);
    setEditProtein(0);
    setEditCarbs(0);
    setEditFat(0);
    setEditFiber(0);
    setErrorMsg(null);
    detectedBarcodeRef.current = null;
  }, []);

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

      const fullName = data.product.brand
        ? `${data.product.brand} - ${data.product.name}`
        : data.product.name;

      setBarcodeInput(cleanCode);
      setProduct(data.product);
      setEditName(fullName);
      setEditCategory(inferCategory(fullName));
      setEditServingSize(data.product.servingSize || "100g");
      setEditCalories(data.product.calories || 0);
      setEditProtein(data.product.protein || 0);
      setEditCarbs(data.product.carbs || 0);
      setEditFat(data.product.fat || 0);
      setEditFiber(data.product.fiber || 0);
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
   * Save scanned product to Custom Foods
   * ---------------------------------------------------------
   */

  const handleSaveToCustomFood = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!editName.trim()) {
      toast.error("Please enter a food name");
      return;
    }
    if (!editServingSize.trim()) {
      toast.error("Please enter a serving size");
      return;
    }

    try {
      setSavingCustom(true);

      const payload: FoodFormValues = {
        name: editName.trim(),
        category: editCategory,
        servingSize: editServingSize.trim(),
        calories: Math.max(0, Number(editCalories) || 0),
        protein: Math.max(0, Number(editProtein) || 0),
        carbs: Math.max(0, Number(editCarbs) || 0),
        fat: Math.max(0, Number(editFat) || 0),
        fiber: Math.max(0, Number(editFiber) || 0),
        image: product?.image || undefined,
      };

      const savedFood = await createCustomFood(payload);

      toast.success(`Saved "${payload.name}" to Custom Foods! 🥗`);
      notifyDataUpdated("meal");

      onOpenChange(false);
      resetScannerState();

      await onCustomFoodSaved?.(savedFood);
      await onLogged?.();

      router.refresh();
    } catch (err) {
      console.error("Failed to save custom food from barcode:", err);
      toast.error("Failed to save custom food. Please check inputs.");
    } finally {
      setSavingCustom(false);
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

  const createDetector = useCallback(async () => {
    const BarcodeDetectorCtor = (
      window as typeof window & {
        BarcodeDetector?: BarcodeDetectorConstructor & {
          getSupportedFormats?: () => Promise<string[]>;
        };
      }
    ).BarcodeDetector;

    if (!BarcodeDetectorCtor) {
      return null;
    }

    let formats = BARCODE_FORMATS;

    // Narrow to formats the platform actually supports, when it can
    // tell us. Some platforms otherwise throw on construction if
    // even one requested format is unsupported (see catch below).
    if (BarcodeDetectorCtor.getSupportedFormats) {
      try {
        const supported = await BarcodeDetectorCtor.getSupportedFormats();
        const narrowed = BARCODE_FORMATS.filter((format) =>
          supported.includes(format)
        );

        if (narrowed.length > 0) {
          formats = narrowed;
        }
      } catch {
        // Fall through and try with the full format list.
      }
    }

    try {
      return new BarcodeDetectorCtor({ formats });
    } catch (error) {
      console.error("BarcodeDetector construction failed:", error);
      return null;
    }
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

        const detector = await createDetector();

        if (!detector) {
          setErrorMsg(
            "Automatic barcode scanning is not supported in this browser. Please enter the barcode manually."
          );
          return;
        }

        detectorRef.current = detector;

        // -----------------------------------------
        // Confirm camera hardware exists before asking
        // permission for it — avoids a confusing generic
        // error on devices with no camera at all.
        // -----------------------------------------

        const hasCamera = await deviceHasCamera();

        if (hasCamera === false) {
          setErrorMsg(
            "No camera was found on this device. Please enter the barcode manually."
          );
          return;
        }

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
            NotFoundError:
              "No camera was found on this device. Please enter the barcode manually.",
            OverconstrainedError:
              "No camera on this device matches the required settings. Please enter the barcode manually.",
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
      resetScannerState();
    }
  }, [open, stopCamera, resetScannerState]);

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-lg rounded-3xl p-4 sm:p-5 gap-3.5 sm:gap-4 max-h-[88dvh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden no-scrollbar overscroll-contain box-border min-w-0">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
            <ScanBarcode className="w-5 h-5 text-primary shrink-0" />
            <span>Barcode Food Scanner</span>
          </DialogTitle>
        </DialogHeader>

        {/* =====================================================
            WHEN NO PRODUCT SCANNED YET: SCANNER & MANUAL INPUT
        ===================================================== */}
        {!product && (
          <div className="space-y-4">
            {/* Camera View */}
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
                      {facingMode === "environment"
                        ? "Rear camera"
                        : "Front camera"}
                    </div>
                  </div>
                </div>

                <p className="text-center text-[11px] text-muted-foreground">
                  Align the barcode inside the frame. It will scan automatically.
                </p>
              </div>
            )}

            {/* Manual input */}
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

            {/* Camera Button */}
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

            {/* Quick Test Barcodes */}
            {!cameraOpen && (
              <div className="space-y-1.5 pt-1">
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

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            PRODUCT SCANNED: EDITABLE CUSTOM FOOD FORM
        ===================================================== */}
        {product && (
          <div className="p-4 sm:p-5 rounded-3xl bg-card border border-primary/20 shadow-md space-y-4 animate-in fade-in">
            {/* Header with Rescan */}
            <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-3">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] uppercase font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                    Scanned Product
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    #{product.barcode}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold tracking-tight mt-1.5 flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-primary shrink-0" />
                  <span>Edit &amp; Save to Custom Foods</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Review or edit the values before saving. Once saved, you can
                  search and add it to any meal anytime with flexible portions!
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetScannerState}
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Rescan
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveToCustomFood} className="space-y-3">
              {/* Food Name */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Food Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Milk Powder or Protein Bar"
                  required
                  className="rounded-xl h-10 font-semibold"
                />
              </div>

              {/* Category & Serving Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Category</Label>
                  <select
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(
                        e.target.value as FoodFormValues["category"]
                      )
                    }
                    className="w-full h-10 rounded-xl px-3 bg-background border border-input text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                  >
                    {FOOD_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">
                    Serving Size (Base)
                  </Label>
                  <Input
                    value={editServingSize}
                    onChange={(e) => setEditServingSize(e.target.value)}
                    placeholder="e.g. 100g, 1 cup (240ml), 1 pack"
                    required
                    className="rounded-xl h-10"
                  />
                </div>
              </div>

              {/* Calories */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Calories (kcal)
                  </Label>
                  <span className="text-[11px] text-primary font-bold">
                    {editCalories} kcal
                  </span>
                </div>
                <Input
                  type="number"
                  min={0}
                  value={editCalories}
                  onChange={(e) =>
                    setEditCalories(Math.max(0, Number(e.target.value)))
                  }
                  required
                  className="rounded-xl h-10 font-bold text-primary"
                />
              </div>

              {/* Macro breakdown grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Protein (g)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={editProtein}
                    onChange={(e) =>
                      setEditProtein(Math.max(0, Number(e.target.value)))
                    }
                    className="rounded-xl h-9 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    Carbs (g)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={editCarbs}
                    onChange={(e) =>
                      setEditCarbs(Math.max(0, Number(e.target.value)))
                    }
                    className="rounded-xl h-9 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    Fat (g)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={editFat}
                    onChange={(e) =>
                      setEditFat(Math.max(0, Number(e.target.value)))
                    }
                    className="rounded-xl h-9 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Fiber (g)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={editFiber}
                    onChange={(e) =>
                      setEditFiber(Math.max(0, Number(e.target.value)))
                    }
                    className="rounded-xl h-9 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Info Notice */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  This food will be saved to your Custom Foods database. You can
                  search it and log any portion size directly to your diet log
                  anytime!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={savingCustom || !editName.trim()}
                  className="w-full rounded-xl h-11 bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-1.5 shadow-md"
                >
                  {savingCustom ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving to Custom Foods...
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-4 h-4" />
                      Save to Custom Foods 🥗
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}