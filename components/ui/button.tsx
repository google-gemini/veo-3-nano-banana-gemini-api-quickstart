"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-glow hover:brightness-110 active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent active:scale-[0.98]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        ghost:
          "bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground",
        danger:
          "bg-destructive text-destructive-foreground hover:brightness-110 active:scale-[0.98]",
        // For controls that sit on top of imagery.
        glass:
          "bg-black/45 text-white backdrop-blur-md border border-white/15 hover:bg-black/60 active:scale-[0.98]",
      },
      size: {
        sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
        md: "h-10 px-4 [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        // Icon buttons stay at 44px on touch devices for comfortable targets.
        icon: "h-11 w-11 md:h-10 md:w-10 rounded-full [&_svg]:size-5",
        "icon-sm": "h-9 w-9 rounded-full [&_svg]:size-4",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, block, loading, disabled, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
