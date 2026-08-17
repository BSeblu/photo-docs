"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Photo {
  id: string;
  dataUrl: string;
  timestamp: number;
  rejected: boolean;
  uploadStatus: "idle" | "uploading" | "success" | "error";
}

interface PhotoStripProps {
  photos: Photo[];
  selectedCount: number;
  rejectedCount: number;
  /** If true, tablet side-by-side mode — strip gets a fixed width and expands vertically */
  sideBySide?: boolean;
  onToggleRejection: (photoId: string) => void;
  className?: string;
}

/**
 * PhotoStrip — horizontal scrollable row of captured thumbnails.
 * Smartphone portrait: horizontal scroll, snap-mandatory, full-width.
 * Smartphone landscape: horizontal scroll, more compact.
 * Tablet (side-by-side mode): narrower fixed column, wrap-enabled, 3-4 thumbs visible.
 */
export const PhotoStrip = React.forwardRef<HTMLDivElement, PhotoStripProps>(
  (
    { photos, selectedCount, rejectedCount, sideBySide = false, onToggleRejection, className, ...props },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          "w-full border-t border-zinc-800 bg-zinc-950",
          // Tablet side-by-side: fixed width column
          sideBySide && "w-48 shrink-0 border-t-0 border-l border-zinc-800",
          className
        )}
        aria-label="Captured photos strip"
        {...props}
      >
        {photos.length === 0 && (
          <div className="flex items-center justify-center py-6 text-zinc-600 text-sm">
            No photos yet
          </div>
        )}

        {photos.length > 0 && (
          <div
            className={cn(
              "flex gap-2 p-2",
              // Smartphone: horizontal scroll with snap
              !sideBySide && "overflow-x-auto snap-x snap-mandatory",
              // Tablet side-by-side: wrap to show 3-4 thumbnails
              sideBySide && "overflow-x-visible flex-wrap snap-none",
              "overflow-y-auto"
            )}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={cn(
                  "relative flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden cursor-pointer transition-all",
                  "snap-center",
                  photo.rejected
                    ? "border-red-500 opacity-60"
                    : "border-zinc-700 hover:border-zinc-500",
                  // Tablet: slightly larger thumbnails
                  sideBySide && "w-20 h-20 snap-none"
                )}
                onClick={() => onToggleRejection(photo.id)}
                role="button"
                aria-pressed={photo.rejected}
                aria-label={
                  photo.rejected
                    ? "Rejected photo, tap to restore"
                    : "Selected photo, tap to reject"
                }
              >
                {photo.dataUrl ? (
                  <img
                    src={photo.dataUrl}
                    alt="Captured photo"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">
                    {photo.rejected ? "✕" : "○"}
                  </div>
                )}

                {photo.rejected && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-lg font-bold">✕</span>
                  </div>
                )}

                {photo.uploadStatus === "uploading" && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={50} className="h-1 rounded-t-none" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Rejected count badge */}
        {rejectedCount > 0 && (
          <div className="px-2 py-1 text-xs text-red-400 border-t border-zinc-800">
            {rejectedCount} rejected
          </div>
        )}
      </section>
    );
  }
);

PhotoStrip.displayName = "PhotoStrip";