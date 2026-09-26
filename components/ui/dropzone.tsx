"use client";

import { cn } from "@/lib/utils";
import { UploadCloudIcon } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { TooltipProvider } from "./tooltip";

type DropzoneComponentProps = {
  onDrop: (acceptedFiles: File[]) => void;
  className?: string;
  children?: React.ReactNode;
};

const Dropzone = ({ onDrop, className, children }: DropzoneComponentProps) => {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-accent",
        isDragActive && "border-primary bg-primary/8",
        className
      )}
    >
      <TooltipProvider>
        <input {...getInputProps()} />
        {children ? (
          children
        ) : isDragActive ? (
          <p className="text-sm font-medium text-primary">Drop the files here…</p>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <UploadCloudIcon className="size-8" />
            <p className="text-sm">
              Drag &amp; drop files here, or click to select files
            </p>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};

export default Dropzone;
