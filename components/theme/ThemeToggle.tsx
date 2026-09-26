"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const nextLabel = resolvedTheme === "dark" ? "Switch to light" : "Switch to dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleTheme}
          aria-label={nextLabel}
          className={`relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${className}`}
        >
          <Sun
            className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-300 dark:rotate-0 dark:scale-100"
            aria-hidden="true"
          />
          <Moon
            className="h-5 w-5 rotate-0 scale-100 transition-transform duration-300 dark:-rotate-90 dark:scale-0"
            aria-hidden="true"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{nextLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}
