"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The control-surface shell shared by the studio side rails.
 * Replaces the identical class string previously duplicated across
 * PhotoEditorControls, ImageComposerControls and AlbumComposerControls.
 */
export function Panel({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/95 text-card-foreground shadow-panel backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky top-0 z-10 -mx-4 mb-4 flex items-center justify-between border-b border-border bg-card/80 px-4 py-2.5 backdrop-blur-md",
        className
      )}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}

export function PanelSection({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      {label ? (
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h3>
      ) : null}
      {children}
    </section>
  );
}

export function PanelDivider({ className }: { className?: string }) {
  return <div className={cn("my-4 h-px bg-border", className)} />;
}
