"use client";

import { useEffect, useId, useRef } from "react";

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
  auto: { w: 0, h: 0, format: "fluid" },
  banner: { w: 468, h: 60, format: "rectangle" },
  "large-banner": { w: 728, h: 90, format: "rectangle" },
  leaderboard: { w: 970, h: 90, format: "rectangle" },
  "medium-rectangle": { w: 300, h: 250, format: "rectangle" },
  "large-rectangle": { w: 336, h: 280, format: "rectangle" },
  "half-page": { w: 300, h: 600, format: "rectangle" },
};

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
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
  label,
  maxWidth,
}: AdUnitProps) {
  const instanceId = useId().replace(/:/g, "");
  const effectiveSlot = (slotId ?? ADSENSE_DEFAULT_SLOT ?? "").trim();
  const effectiveClient = (ADSENSE_CLIENT_ID ?? "").trim();
  const preset = SIZE_PRESETS[size];
  const isResponsive = size === "auto";
  const pushed = useRef(false);

  const shouldRender = !!effectiveClient && !!effectiveSlot && !IS_DEV;

  useEffect(() => {
    if (!shouldRender || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.warn("AdSense unit failed to push:", err);
    }
  }, [shouldRender, effectiveSlot, effectiveClient, instanceId]);

  if (!shouldRender) {
    if (IS_DEV) {
      return (
        <div
          className={`mx-auto w-full max-w-5xl ${className}`}
          aria-hidden="true"
        >
          <div
            className="flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/30 px-4 py-6 text-xs text-muted-foreground"
            style={{
              minHeight: preset.h > 0 ? preset.h : 110,
              maxWidth: maxWidth ?? (preset.w > 0 ? preset.w : undefined),
            }}
          >
            <span>
              AdSense {size} {label ? `- ${label}` : ""} is disabled in local
              dev. Set{" "}
              <code className="mx-1 rounded bg-background/60 px-1.5 py-0.5 font-mono text-[11px]">
                NEXT_PUBLIC_ADSENSE_CLIENT_ID
              </code>{" "}
              +{" "}
              <code className="mx-1 rounded bg-background/60 px-1.5 py-0.5 font-mono text-[11px]">
                NEXT_PUBLIC_ADSENSE_SLOT_ID
              </code>{" "}
              in prod.
            </span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`mx-auto w-full ${className}`}
      style={{ maxWidth: maxWidth ?? (preset.w > 0 ? preset.w : "100%") }}
    >
      {label && (
        <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
          {label}
        </p>
      )}
      <div className="flex justify-center overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-1.5 backdrop-blur-sm">
        <ins
          key={`${effectiveSlot}-${instanceId}`}
          className="adsbygoogle block"
          style={{
            display: "block",
            width: isResponsive ? "100%" : preset.w,
            minHeight: isResponsive ? 90 : preset.h,
          }}
          data-ad-client={effectiveClient}
          data-ad-slot={effectiveSlot}
          data-ad-format={isResponsive ? "fluid" : preset.format}
          data-full-width-responsive={isResponsive ? "true" : undefined}
          data-ad-layout={isResponsive ? "in-article" : undefined}
        />
      </div>
    </div>
  );
}
