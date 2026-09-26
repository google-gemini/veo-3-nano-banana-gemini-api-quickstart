"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  /** CSS color for the active state — pass a `var(--mode-*)` token. */
  accent?: string;
  disabled?: boolean;
  tooltip?: string;
  trailing?: React.ReactNode;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

/** The studio mode switcher. Active colour comes from the `--mode-*` tokens. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  ...rest
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      className={cn(
        "flex gap-1 rounded-lg border border-border bg-background/50 p-1",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        const button = (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            disabled={option.disabled}
            onClick={() => !option.disabled && onChange(option.value)}
            style={
              active && option.accent
                ? {
                    color: option.accent,
                    backgroundColor: `color-mix(in oklch, ${option.accent} 16%, transparent)`,
                    boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${option.accent} 32%, transparent)`,
                  }
                : undefined
            }
            className={cn(
              "flex min-h-11 flex-1 touch-manipulation items-center justify-center gap-2 rounded-md px-2 text-sm font-medium transition-all sm:px-3 [&_svg]:size-4 [&_svg]:shrink-0",
              active
                ? "text-foreground"
                : option.disabled
                  ? "cursor-not-allowed text-muted-foreground/50"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
            {option.trailing}
          </button>
        );

        return option.tooltip ? (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>
              <p>{option.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          button
        );
      })}
    </div>
  );
}

export default Segmented;
