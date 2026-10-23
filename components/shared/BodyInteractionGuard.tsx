"use client";

import { useEffect } from "react";

/**
 * Safety net against a leaked modal scroll/interaction lock.
 *
 * Radix (`react-remove-scroll`) locks the page while a Dialog/Sheet/Select is
 * open by adding a `block-interactivity-{id}` class (`pointer-events: none`)
 * to <body>, plus inline `overflow: hidden` scroll-lock styles. If the cleanup
 * is missed — most commonly when the app navigates while a modal is still
 * animating out — those styles leak, leaving the whole app (including the
 * bottom navigation) unclickable or unscrollable: it looks frozen.
 *
 * This guard restores the page ONLY when no modal node is actually mounted, so
 * it never fights a genuinely open modal.
 */
export default function BodyInteractionGuard() {
  useEffect(() => {
    const isAnyModalMounted = () =>
      !!document.querySelector(
        '[role="dialog"], [role="alertdialog"], [data-radix-popper-content-wrapper], [data-radix-menu-content]',
      );

    const restore = () => {
      if (isAnyModalMounted()) return;

      // 1. Remove leaked react-remove-scroll interaction blockers.
      Array.from(document.body.classList)
        .filter(
          (c) =>
            c.startsWith("block-interactivity-") ||
            c.startsWith("allow-interactivity-"),
        )
        .forEach((c) => document.body.classList.remove(c));

      // 2. Reset leaked inline scroll-lock styles.
      [document.documentElement, document.body].forEach((el) => {
        if (el.style.pointerEvents === "none") el.style.pointerEvents = "";
        if (el.style.overflow === "hidden") el.style.overflow = "";
        if (el.style.overflowY === "hidden") el.style.overflowY = "";
        if (el.style.paddingRight) el.style.paddingRight = "";
      });
    };

    let timer: number | undefined;
    const schedule = () => {
      window.clearTimeout(timer);
      // Let the DOM settle so we don't unfreeze a modal that is mid-open.
      timer = window.setTimeout(restore, 150);
    };

    // Radix portals mount/unmount as direct children of <body>, so observing
    // body's own attributes + direct children is enough (and cheap).
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "style"],
      childList: true,
    });

    // Also re-check when the tab/app is brought back to the foreground.
    document.addEventListener("visibilitychange", schedule);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);

  return null;
}
