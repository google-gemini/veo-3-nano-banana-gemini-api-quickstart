"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Transform-driven switch — replaces the knob that fought an inline `left`. */
export function Toggle({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: ToggleProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {label || description ? (
        <span className="min-w-0">
          {label ? (
            <span className="block text-xs font-medium text-foreground">
              {label}
            </span>
          ) : null}
          {description ? (
            <span className="block text-[11px] text-muted-foreground">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "inline-block size-3.5 rounded-full bg-background shadow-sm transition-transform duration-200",
            checked ? "translate-x-[1.125rem]" : "translate-x-[0.1875rem]"
          )}
        />
      </button>
    </label>
  );
}

export default Toggle;
