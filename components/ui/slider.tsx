"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange: (value: number) => void;
  /** Optional CSS gradient for the track (e.g. the warmth control). */
  trackGradient?: string;
  formatValue?: (value: number) => string;
}

/**
 * One range control for the whole app. Replaces five bare `<input type=range>`
 * elements plus PhotoEditorControls' hand-positioned warmth knob.
 */
export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  trackGradient,
  formatValue,
  className,
  ...props
}: SliderProps) {
  const id = React.useId();
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs">
          <label htmlFor={id} className="font-medium text-muted-foreground">
            {label}
          </label>
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      ) : null}
      <div className="relative h-5">
        <div
          className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted"
          style={trackGradient ? { background: trackGradient } : undefined}
        >
          {trackGradient ? null : (
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          )}
        </div>
        <div
          className="pointer-events-none absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm transition-[left] duration-75"
          style={{ left: `calc(${pct}% - 0.4375rem)` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          {...props}
        />
      </div>
    </div>
  );
}

export default Slider;
