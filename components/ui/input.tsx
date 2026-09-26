"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-md border border-input bg-background/60 text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:opacity-50 disabled:cursor-not-allowed";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md";
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = "md", icon, ...props }, ref) => {
    const sizing =
      inputSize === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-3 text-sm";

    if (!icon) {
      return (
        <input ref={ref} className={cn(base, sizing, className)} {...props} />
      );
    }

    return (
      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 flex items-center text-muted-foreground",
            inputSize === "sm" ? "pl-2.5 [&_svg]:size-3.5" : "pl-3 [&_svg]:size-4"
          )}
        >
          {icon}
        </span>
        <input
          ref={ref}
          className={cn(
            base,
            sizing,
            inputSize === "sm" ? "pl-8" : "pl-9",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(base, "resize-none px-3 py-2.5 text-sm", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      base,
      "h-10 cursor-pointer appearance-none bg-card py-0 pl-3 pr-9 text-sm",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
