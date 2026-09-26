"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Corner the panel grows from, relative to its trigger. */
  align?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

const alignment: Record<NonNullable<PopoverProps["align"]>, string> = {
  "top-left": "bottom-full left-0 mb-2 origin-bottom-left",
  "top-right": "bottom-full right-0 mb-2 origin-bottom-right",
  "bottom-left": "top-full left-0 mt-2 origin-top-left",
  "bottom-right": "top-full right-0 mt-2 origin-top-right",
};

/**
 * Dismissible floating panel. Replaces the three hand-rolled
 * "transparent scrim + absolutely positioned card" copies.
 * Render inside a `relative` wrapper alongside the trigger.
 */
export function Popover({
  open,
  onClose,
  children,
  align = "bottom-right",
  className,
}: PopoverProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // A document listener rather than a full-screen scrim: ancestors with
    // `backdrop-filter` (the composer card, the header) become the containing
    // block for `position: fixed`, so a scrim would only cover that ancestor.
    const onPointerDown = (e: MouseEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = e.target as Node;
      // The trigger lives in the same relative wrapper, so ignore it too and
      // let its own onClick do the toggling.
      const scope = panel.parentElement ?? panel;
      if (!scope.contains(target)) onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute z-[var(--z-popover)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-elevated animate-in fade-in zoom-in-95 duration-150",
        alignment[align],
        className
      )}
    >
      {children}
    </div>
  );
}

export function PopoverItem({
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
        active
          ? "bg-primary/12 text-primary"
          : "text-foreground hover:bg-accent",
        className
      )}
      {...props}
    />
  );
}

export default Popover;
