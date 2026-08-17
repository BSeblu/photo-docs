"use client";

import React, { useState, useCallback, useRef } from "react";
import { useOrientation } from "@/hooks/useOrientation";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
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
// Helpers
// ---------------------------------------------------------------------------

const MIN_TAP_DURATION_MS = 150;

// ---------------------------------------------------------------------------
// CapturePage
// ---------------------------------------------------------------------------

export default function CapturePage() {
  const { orientation, width } = useOrientation();
  const isSmall = width < 768;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const captureButtonRef = useRef<HTMLButtonElement>(null);
  const lastTapTimeRef = useRef(0);

  // Debounced capture — prevents accidental background taps
  const debouncedCapture = useDebounce(() => {
    handleCapture();
  }, MIN_TAP_DURATION_MS);

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

  const handleCaptureTap = useCallback(() => {
    const now = Date.now();
    const elapsed = now - lastTapTimeRef.current;

    if (elapsed < MIN_TAP_DURATION_MS) {
      return;
    }

    lastTapTimeRef.current = now;
    debouncedCapture();
  }, [debouncedCapture]);

  const selectedCount = photos.filter((p) => !p.rejected).length;
  const rejectedCount = photos.filter((p) => p.rejected).length;

  const viewfinderHeight = isSmall
    ? "h-[60vh]"
    : orientation === "landscape"
      ? "h-full"
      : "h-[55vh]";

  const stripMaxHeight = isSmall
    ? "h-[25vh]"
    : orientation === "landscape"
      ? "h-[30vh] w-48 shrink-0"
      : "h-[30vh]";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-black">
      {/* ─── Viewfinder ──────────────────────────────────────────── */}
      <section
        className={cn(
          "relative w-full bg-zinc-900",
          viewfinderHeight,
          "flex items-center justify-center"
        )}
        aria-label="Camera viewfinder"
      >
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-600 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-zinc-500" />
          </div>
          <span className="text-sm">Viewfinder</span>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute bottom-0 left-0 w-full">
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}
      </section>

      {/* ─── Photo Strip ─────────────────────────────────────────── */}
      {photos.length > 0 && (
        <section
          className={cn(
            "w-full border-t border-zinc-800 bg-zinc-950",
            stripMaxHeight,
            "overflow-y-auto"
          )}
          aria-label="Captured photos strip"
        >
          <div
            className={cn(
              "flex gap-2 p-2",
              isSmall ? "overflow-x-auto" : "overflow-x-auto flex-wrap",
              "snap-x snap-mandatory"
            )}
          >
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={cn(
                  "relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden cursor-pointer transition-all",
                  photo.rejected
                    ? "border-red-500 opacity-60"
                    : "border-zinc-700 hover:border-zinc-500",
                  isSmall ? "w-16 h-16" : "w-20 h-20"
                )}
                onClick={() => handleToggleRejection(photo.id)}
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
        </section>
      )}

      {/* ─── Capture Button ──────────────────────────────────────── */}
      <footer
        className={cn(
          "w-full px-4 py-3 bg-zinc-900 border-t border-zinc-800",
          "flex justify-center"
        )}
      >
        <Button
          ref={captureButtonRef}
          variant="default"
          size="lg"
          className={cn(
            "w-full max-w-xs h-16 text-lg font-semibold rounded-full",
            "active:scale-95 transition-transform",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          onClick={handleCaptureTap}
          disabled={capturing}
          aria-label="Capture photo"
        >
          {capturing ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-white animate-pulse" />
              Capturing...
            </span>
          ) : (
            "● Capture"
          )}
        </Button>
      </footer>

      {/* ─── Submit / Cancel row ─────────────────────────────────── */}
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

      {/* ─── Toast ──────────────────────────────────────────────── */}
      <Toaster />
    </div>
  );
}