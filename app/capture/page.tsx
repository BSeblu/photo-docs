"use client";

import React, { useState, useCallback } from "react";
import { useOrientation } from "@/hooks/useOrientation";
import { CaptureButton } from "@/components/capture/capturebutton";
import { PhotoStrip } from "@/components/capture/photostrip";
import { Viewfinder } from "@/components/capture/viewfinder";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Photo {
  id: string;
  dataUrl: string;
  timestamp: number;
  rejected: boolean;
  uploadStatus: "idle" | "uploading" | "success" | "error";
}

// ---------------------------------------------------------------------------
// CapturePage
// ---------------------------------------------------------------------------

export default function CapturePage() {
  const { isSmall, isMedium, orientation } = useOrientation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCapture = useCallback(() => {
    const now = Date.now();
    const photo: Photo = {
      id: `photo-${now}`,
      dataUrl: "",
      timestamp: now,
      rejected: false,
      uploadStatus: "idle",
    };
    setPhotos((prev) => [photo, ...prev]);
    toast("Photo captured", {
      description: `${photos.length + 1} photo(s) in session`,
    });
  }, [photos.length]);

  const handleToggleRejection = useCallback((photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p, rejected: !p.rejected } : p
      )
    );
  }, []);

  const selectedCount = photos.filter((p) => !p.rejected).length;
  const rejectedCount = photos.filter((p) => p.rejected).length;

  // Tablet side-by-side layout: viewfinder left, strip right
  const isTabletSideBySide = isMedium && orientation === "landscape";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black">
      {/* ─── Main content area ────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-col flex-1 overflow-hidden",
          // Tablet landscape: side-by-side
          isTabletSideBySide && "flex-row"
        )}
      >
        {/* ─── Viewfinder ──────────────────────────────────────── */}
        <div
          className={cn(
            // Smartphone portrait: viewfinder fills top ~60%
            isSmall && "h-[60vh]",
            // Smartphone landscape: viewfinder fills available
            !isSmall && orientation === "landscape" && "h-full",
            // Tablet portrait: viewfinder above strip
            isMedium && orientation === "portrait" && "h-[55vh]",
            // Tablet landscape: side-by-side, viewfinder fills remaining
            isTabletSideBySide && "flex-1"
          )}
        >
          <Viewfinder
            uploading={capturing}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* ─── Photo Strip ─────────────────────────────────────── */}
        {photos.length > 0 && (
          <div
            className={cn(
              // Smartphone: strip below viewfinder, full width
              isSmall && "h-[25vh] w-full",
              // Tablet portrait: strip below viewfinder
              isMedium && orientation === "portrait" && "h-[30vh] w-full",
              // Tablet landscape: side-by-side strip
              isTabletSideBySide && "w-48 shrink-0 h-full"
            )}
          >
            <PhotoStrip
              photos={photos}
              selectedCount={selectedCount}
              rejectedCount={rejectedCount}
              sideBySide={isTabletSideBySide}
              onToggleRejection={handleToggleRejection}
            />
          </div>
        )}
      </div>

      {/* ─── Capture Button ───────────────────────────────────── */}
      <footer className="w-full px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex justify-center">
        <CaptureButton
          capturing={capturing}
          onCapture={handleCapture}
        />
      </footer>

      {/* ─── Submit / Cancel row ──────────────────────────────── */}
      {photos.length > 0 && (
        <div className="flex gap-2 px-4 py-2 bg-zinc-900 border-t border-zinc-800">
          <Button
            variant="outline"
            className="flex-1"
            disabled={selectedCount === 0}
            onClick={() => {
              toast("Uploading...", {
                description: `${selectedCount} photo(s) queued for upload`,
              });
            }}
          >
            Submit ({selectedCount})
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => {
              setPhotos([]);
              toast("Session canceled", {
                description: "All photos discarded",
              });
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* ─── Toast ────────────────────────────────────────────── */}
      <Toaster />
    </div>
  );
}