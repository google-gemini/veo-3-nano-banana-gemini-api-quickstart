"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function DynamicHeading({ className = "" }: { className?: string }) {
    return (
        <div className={cn("group relative inline-block select-none", className)}>
            {/* Soft accent bloom behind the wordmark, revealed on hover. */}
            <div
                className="pointer-events-none absolute -inset-2 rounded-lg bg-gradient-to-r from-primary via-mode-album to-mode-create opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-35"
                aria-hidden="true"
            />
            <h1 className="relative font-bold tracking-tight">
                <span className="animate-gradient bg-gradient-to-r from-primary via-mode-album to-mode-create bg-[length:200%_auto] bg-clip-text text-transparent transition-all duration-300 group-hover:tracking-wide">
                    Photoverse
                </span>
            </h1>
        </div>
    );
}
