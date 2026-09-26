"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
  full: "max-w-7xl",
} as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  size?: keyof typeof sizes;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Renders a bare frame (no chrome) — used by the image lightbox. */
  bare?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * The single modal implementation for the app: portalled, scroll-locked,
 * Escape- and backdrop-dismissible, with focus capture and restore.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  size = "md",
  children,
  footer,
  bare = false,
  className,
  contentClassName,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);
  const titleId = React.useId();

  React.useEffect(() => setMounted(true), []);

  // Escape to close.
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Lock body scroll, preserving whatever the page had before.
  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Move focus in on open, hand it back on close.
  React.useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(
        '[data-autofocus], button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (target ?? panelRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      restoreFocusRef.current?.focus?.();
    };
  }, [open]);

  // Keep Tab inside the dialog.
  const onKeyDownTrap = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusable = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-scrim p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDownTrap}
        className={cn(
          "relative flex w-full flex-col overflow-hidden outline-none animate-in fade-in zoom-in-95 duration-200",
          sizes[size],
          bare
            ? "max-h-full"
            : "max-h-[90vh] rounded-2xl border border-border bg-elevated text-elevated-foreground shadow-elevated",
          className
        )}
      >
        {!bare && (title || description) ? (
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-gradient-to-r from-primary/8 to-transparent px-6 py-5">
            <div className="flex items-start gap-3">
              {icon ? (
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                  {icon}
                </span>
              ) : null}
              <div>
                {title ? (
                  <h2 id={titleId} className="text-lg font-semibold tracking-tight">
                    {title}
                  </h2>
                ) : null}
                {description ? (
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
            </div>
            <ModalClose onClose={onClose} />
          </header>
        ) : null}

        {bare || (!title && !description) ? (
          <ModalClose onClose={onClose} floating glass={bare} />
        ) : null}

        <div
          className={cn(
            bare ? "flex-1" : "custom-scrollbar flex-1 overflow-y-auto px-6 py-5",
            contentClassName
          )}
        >
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-border bg-card/50 px-6 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

function ModalClose({
  onClose,
  floating = false,
  glass = false,
}: {
  onClose: () => void;
  floating?: boolean;
  /** For bare frames, where the button sits directly on imagery. */
  glass?: boolean;
}) {
  return (
    <button
      onClick={onClose}
      aria-label="Close dialog"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
        glass
          ? "bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
        floating && "absolute right-4 top-4 z-10"
      )}
    >
      <X className="size-5" aria-hidden="true" />
    </button>
  );
}

export default Modal;
