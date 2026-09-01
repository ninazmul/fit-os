"use client";

import { useEffect, useId, useRef, useState } from "react";

export type AdSize =
  | "auto"
  | "banner"
  | "large-banner"
  | "leaderboard"
  | "medium-rectangle"
  | "large-rectangle"
  | "half-page";

type AdUnitProps = {
  slotId?: string;
  size?: AdSize;
  className?: string;
  label?: string;
  maxWidth?: string;
};

const SIZE_PRESETS: Record<AdSize, { w: number; h: number; format: string }> = {
  auto: { w: 0, h: 0, format: "auto" },
  banner: { w: 468, h: 60, format: "horizontal" },
  "large-banner": { w: 728, h: 90, format: "horizontal" },
  leaderboard: { w: 970, h: 90, format: "horizontal" },
  "medium-rectangle": { w: 300, h: 250, format: "rectangle" },
  "large-rectangle": { w: 336, h: 280, format: "rectangle" },
  "half-page": { w: 300, h: 600, format: "vertical" },
};

const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-1213821838926371";
const ADSENSE_DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID;
const IS_DEV = process.env.NODE_ENV !== "production";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdUnit({
  slotId,
  size = "auto",
  className = "",
  label = "Sponsored",
  maxWidth,
}: AdUnitProps) {
  const instanceId = useId().replace(/:/g, "");
  const effectiveSlot = (slotId ?? ADSENSE_DEFAULT_SLOT ?? "").trim();
  const effectiveClient = (ADSENSE_CLIENT_ID ?? "").trim();
  const preset = SIZE_PRESETS[size] || SIZE_PRESETS.auto;
  const isResponsive = size === "auto";
  const pushed = useRef(false);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    if (!effectiveClient || pushed.current) return;

    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
        pushed.current = true;
      }
    } catch (err) {
      console.warn("AdSense unit initialization notice:", err);
      setAdFailed(true);
    }
  }, [effectiveClient, effectiveSlot, instanceId]);

  if (adFailed) return null;

  // In local development, show a subtle preview placeholder if no live ads
  if (IS_DEV && !effectiveSlot) {
    return (
      <div
        className={`mx-auto w-full my-4 ${className}`}
        style={{ maxWidth: maxWidth ?? "100%" }}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/20 px-4 py-4 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
            Google AdSense Placement ({size})
          </p>
          <p className="text-[11px] text-muted-foreground/80 max-w-md">
            Active in production with client ID <code className="font-mono text-[10px] bg-muted/60 px-1 py-0.5 rounded text-primary">{effectiveClient}</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto w-full my-4 ${className}`}
      style={{ maxWidth: maxWidth ?? (preset.w > 0 ? `${preset.w}px` : "100%") }}
    >
      {label && (
        <p className="mb-1 text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
          {label}
        </p>
      )}
      <div className="flex justify-center overflow-hidden rounded-2xl border border-border/40 bg-card/30 p-1 backdrop-blur-sm transition-all hover:border-border/60">
        <ins
          key={`${effectiveSlot || "auto"}-${instanceId}`}
          className="adsbygoogle block w-full"
          style={{
            display: "block",
            width: isResponsive ? "100%" : `${preset.w}px`,
            minHeight: isResponsive ? "90px" : `${preset.h}px`,
          }}
          data-ad-client={effectiveClient}
          {...(effectiveSlot ? { "data-ad-slot": effectiveSlot } : {})}
          data-ad-format={isResponsive ? "auto" : preset.format}
          data-full-width-responsive={isResponsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}
