"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ViewfinderProps {
  /** Aspect ratio to preserve (width / height). Default 4/3. */
  aspectRatio?: number;
  /** Whether an upload is currently in progress */
  uploading?: boolean;
  /** Upload progress percentage (0–100) */
  uploadProgress?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * Viewfinder — camera preview area that preserves aspect ratio.
 * On smartphone it fills the top portion of the screen;
 * on tablet it shares horizontal space with the photo strip.
 */
export const Viewfinder = React.forwardRef<HTMLDivElement, ViewfinderProps>(
  ({ aspectRatio = 4 / 3, uploading, uploadProgress = 0, className, ...props }, ref) => {
    const paddingBottom = `${(1 / aspectRatio) * 100}%`;

    return (
      <section
        ref={ref}
        className={cn(
          "relative w-full bg-zinc-900 flex items-center justify-center",
          "overflow-hidden",
          className
        )}
        aria-label="Camera viewfinder"
        style={{ paddingBottom }}
        {...props}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-400">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-600 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-zinc-500" />
          </div>
          <span className="text-sm">Viewfinder</span>
        </div>

        {uploading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute bottom-0 left-0 w-full">
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}
      </section>
    );
  }
);

Viewfinder.displayName = "Viewfinder";