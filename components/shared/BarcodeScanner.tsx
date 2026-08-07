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
  const [facingMode, setFacingMode] =
    useState<FacingMode>("environment");
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const detectorRef = useRef<InstanceType<BarcodeDetectorConstructor> | null>(
    null
  );

  const animationFrameRef = useRef<number | null>(null);
  const detectingRef = useRef(false);
  const detectedBarcodeRef = useRef<string | null>(null);

  const router = useRouter();

  const todayStr =
    dateStr || new Date().toISOString().split("T")[0];

  /*
   * ---------------------------------------------------------
   * Barcode lookup
   * ---------------------------------------------------------
   */

  const handleLookupBarcode = useCallback(async (code: string) => {
    const cleanCode = code.trim();

    if (!cleanCode) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setProduct(null);

      const res = await fetch(
        `/api/barcode/product/${encodeURIComponent(cleanCode)}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.product) {
        setErrorMsg(
          data.error ||
          `No product found for barcode "${cleanCode}". Try searching manually.`
        );

        throw new Error("Product not found");
      }

      setBarcodeInput(cleanCode);
      setProduct(data.product);
    } catch {
      setErrorMsg(
        (current) =>
          current ||
          "Error connecting to Open Food Facts barcode database."
      );
    } finally {
      setLoading(false);
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

      toast.success(
        `Logged ${item.name} (${item.calories} kcal)! 📦`
      );

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
   * Stop camera
   * ---------------------------------------------------------
   */

  const stopCamera = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    detectingRef.current = false;

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    detectorRef.current = null;

    setCameraReady(false);
    setCameraOpen(false);
  }, []);

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

    return new BarcodeDetector({
      formats: [
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
      ],
    });
  }, []);

  /*
   * ---------------------------------------------------------
   * Continuous barcode scanning
   * ---------------------------------------------------------
   */

  const scanFrame = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;

    if (!video || !detector) {
      return;
    }

    /*
     * Don't run another detector call while the previous
     * detection is still running.
     */
    if (detectingRef.current) {
      animationFrameRef.current =
        requestAnimationFrame(scanFrame);

      return;
    }

    /*
     * Video must actually have usable dimensions.
     */
    if (
      video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      animationFrameRef.current =
        requestAnimationFrame(scanFrame);

      return;
    }

    detectingRef.current = true;

    try {
      const detectedCodes = await detector.detect(video);

      const detectedCode = detectedCodes
        .map((item) => item.rawValue?.trim())
        .find(Boolean);

      if (detectedCode) {
        /*
         * Avoid processing the same barcode multiple times
         * while the camera is still seeing it.
         */
        if (detectedBarcodeRef.current !== detectedCode) {
          detectedBarcodeRef.current = detectedCode;

          /*
           * Stop camera immediately after successful detection.
           */
          stopCamera();

          await handleLookupBarcode(detectedCode);

          return;
        }
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

    animationFrameRef.current =
      requestAnimationFrame(scanFrame);
  }, [handleLookupBarcode, stopCamera]);

  /*
   * ---------------------------------------------------------
   * Start camera
   * ---------------------------------------------------------
   */

  const startCamera = useCallback(
    async (mode: FacingMode = facingMode) => {
      try {
        setErrorMsg(null);
        setProduct(null);
        setCameraReady(false);

        // -----------------------------------------
        // Cancel previous scanner loop
        // -----------------------------------------

        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        detectingRef.current = false;
        detectedBarcodeRef.current = null;

        // -----------------------------------------
        // Stop previous camera
        // -----------------------------------------

        if (cameraStreamRef.current) {
          cameraStreamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          cameraStreamRef.current = null;
        }

        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
        }

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
          setErrorMsg(
            "Your browser does not support camera access."
          );
          return;
        }

        // -----------------------------------------
        // Check secure context
        // -----------------------------------------

        if (!window.isSecureContext) {
          setErrorMsg(
            "Camera access requires HTTPS. It works on localhost during development."
          );
          return;
        }

        // -----------------------------------------
        // Check BarcodeDetector
        // -----------------------------------------

        const detector = createDetector();

        if (!detector) {
          setErrorMsg(
            "Automatic barcode scanning is not supported in this browser. Please enter the barcode manually."
          );
          return;
        }

        detectorRef.current = detector;

        // -----------------------------------------
        // Check existing camera permission
        // -----------------------------------------

        try {
          if (navigator.permissions?.query) {
            const permission = await navigator.permissions.query({
              name: "camera" as PermissionName,
            });

            if (permission.state === "denied") {
              setErrorMsg(
                "Camera permission is blocked for this site. Please allow Camera access in your browser's site settings, then try again."
              );
              return;
            }
          }
        } catch {
          /*
           * Some browsers don't support querying the camera
           * permission state. That's fine — getUserMedia()
           * below will request it normally.
           */
        }

        // -----------------------------------------
        // Request camera permission
        // -----------------------------------------

        let stream: MediaStream;

        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: {
                ideal: mode,
              },
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
              aspectRatio: {
                ideal: 16 / 9,
              },
            },
            audio: false,
          });
        } catch (error) {
          console.error("getUserMedia error:", error);

          const cameraError =
            error instanceof DOMException
              ? error.name
              : "";

          if (cameraError === "NotAllowedError") {
            setErrorMsg(
              "Camera permission was denied. Please allow Camera access for this site in your browser settings, then try again."
            );
          } else if (cameraError === "NotFoundError") {
            setErrorMsg(
              "No camera was found on this device."
            );
          } else if (cameraError === "NotReadableError") {
            setErrorMsg(
              "The camera is already being used by another application."
            );
          } else if (cameraError === "SecurityError") {
            setErrorMsg(
              "Camera access was blocked by the browser's security settings."
            );
          } else {
            setErrorMsg(
              "Unable to access the camera. Please check your browser permissions and try again."
            );
          }

          return;
        }

        // -----------------------------------------
        // Camera permission granted
        // -----------------------------------------

        cameraStreamRef.current = stream;

        setFacingMode(mode);
        setCameraOpen(true);

        // -----------------------------------------
        // Attach stream to video
        // -----------------------------------------

        requestAnimationFrame(async () => {
          const video = videoRef.current;

          if (!video) {
            stream
              .getTracks()
              .forEach((track) => track.stop());

            cameraStreamRef.current = null;
            return;
          }

          try {
            video.srcObject = stream;

            await new Promise<void>((resolve) => {
              if (
                video.readyState >=
                HTMLMediaElement.HAVE_METADATA
              ) {
                resolve();
                return;
              }

              const handleMetadata = () => {
                video.removeEventListener(
                  "loadedmetadata",
                  handleMetadata
                );

                resolve();
              };

              video.addEventListener(
                "loadedmetadata",
                handleMetadata
              );
            });

            await video.play();

            setCameraReady(true);

            // ---------------------------------------
            // Start continuous barcode scanner
            // ---------------------------------------

            if (animationFrameRef.current !== null) {
              cancelAnimationFrame(
                animationFrameRef.current
              );
            }

            animationFrameRef.current =
              requestAnimationFrame(scanFrame);
          } catch (error) {
            console.error(
              "Video playback error:",
              error
            );

            stream
              .getTracks()
              .forEach((track) => track.stop());

            cameraStreamRef.current = null;

            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.srcObject = null;
            }

            setCameraReady(false);

            setErrorMsg(
              "Could not start the camera preview. Please try again."
            );
          }
        });
      } catch (error) {
        console.error("Camera initialization error:", error);

        setCameraReady(false);

        setErrorMsg(
          "Unable to initialize the camera. Please check your browser permissions."
        );
      }
    },
    [createDetector, facingMode, scanFrame]
  );

  /*
   * ---------------------------------------------------------
   * Flip camera
   * ---------------------------------------------------------
   */

  const flipCamera = useCallback(async () => {
    const nextMode: FacingMode =
      facingMode === "environment"
        ? "user"
        : "environment";

    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  /*
   * ---------------------------------------------------------
   * Start scanner when camera mode opens
   * ---------------------------------------------------------
   */

  const openCameraScanner = async () => {
    detectedBarcodeRef.current = null;
    await startCamera("environment");
  };

  /*
   * ---------------------------------------------------------
   * Cleanup
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  /*
   * Close scanner when dialog closes.
   */

  useEffect(() => {
    if (!open) {
      stopCamera();

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

              {/* Dark scanner overlay */}

              <div className="absolute inset-0 pointer-events-none">
                {/* Top */}
                <div className="absolute inset-x-0 top-0 h-[25%] bg-black/45" />

                {/* Bottom */}
                <div className="absolute inset-x-0 bottom-0 h-[25%] bg-black/45" />

                {/* Left */}
                <div className="absolute left-0 top-[25%] bottom-[25%] w-[12%] bg-black/45" />

                {/* Right */}
                <div className="absolute right-0 top-[25%] bottom-[25%] w-[12%] bg-black/45" />

                {/* Scanner frame */}

                <div className="absolute left-[12%] right-[12%] top-[25%] bottom-[25%]">
                  {/* Top-left */}
                  <span className="absolute left-0 top-0 w-8 h-8 border-l-[3px] border-t-[3px] border-white rounded-tl-xl" />

                  {/* Top-right */}
                  <span className="absolute right-0 top-0 w-8 h-8 border-r-[3px] border-t-[3px] border-white rounded-tr-xl" />

                  {/* Bottom-left */}
                  <span className="absolute left-0 bottom-0 w-8 h-8 border-l-[3px] border-b-[3px] border-white rounded-bl-xl" />

                  {/* Bottom-right */}
                  <span className="absolute right-0 bottom-0 w-8 h-8 border-r-[3px] border-b-[3px] border-white rounded-br-xl" />

                  {/* Animated scan line */}

                  {cameraReady && (
                    <div className="absolute left-2 right-2 top-1/2 h-[2px] bg-primary shadow-[0_0_12px_hsl(var(--primary))] animate-pulse" />
                  )}
                </div>
              </div>

              {/* Status */}

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

              {/* Flip camera */}

              <Button
                type="button"
                onClick={flipCamera}
                disabled={!cameraReady}
                className="absolute top-3 right-3 rounded-full w-11 h-11 bg-black/65 hover:bg-black/80 text-white border-0 backdrop-blur-sm"
                aria-label="Flip camera"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              {/* Close camera */}

              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
                className="absolute bottom-3 right-3 rounded-full w-11 h-11 bg-white/90 hover:bg-white text-black border-0"
                aria-label="Close camera"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Scanner icon */}

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
              Align the barcode inside the frame. It will scan
              automatically.
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
                onChange={(e) =>
                  setBarcodeInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLookupBarcode(barcodeInput);
                  }
                }}
                className="rounded-xl text-sm font-mono"
              />

              <Button
                disabled={
                  loading || !barcodeInput.trim()
                }
                onClick={() =>
                  handleLookupBarcode(barcodeInput)
                }
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
            CAMERA BUTTON
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
              {[
                {
                  label: "Oats",
                  code: "3033710065067",
                },
                {
                  label: "Nutella",
                  code: "3017620422003",
                },
                {
                  label: "Milk",
                  code: "8712800000497",
                },
                {
                  label: "KitKat",
                  code: "5000159461122",
                },
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

            {/* Macros */}

            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-emerald-500/20 text-center text-xs">
              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">
                  Serving
                </p>

                <p className="font-bold">
                  {product.servingSize}
                </p>
              </div>

              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">
                  Protein
                </p>

                <p className="font-bold text-emerald-600">
                  {product.protein * quantity}g
                </p>
              </div>

              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">
                  Carbs
                </p>

                <p className="font-bold text-blue-600">
                  {product.carbs * quantity}g
                </p>
              </div>

              <div className="p-1.5 rounded-xl bg-background/60">
                <p className="text-[10px] text-muted-foreground">
                  Fat
                </p>

                <p className="font-bold text-purple-600">
                  {product.fat * quantity}g
                </p>
              </div>
            </div>

            {/* Quantity + log */}

            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold">
                  Servings:
                </Label>

                <div className="flex items-center gap-1">
                  {[0.5, 1, 2].map((q) => (
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