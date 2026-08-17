"use client";

import React, { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 150;

interface CaptureButtonProps {
  /** Whether a capture is already in-flight */
  capturing?: boolean;
  /** Called when the user deliberately taps the capture button */
  onCapture: () => void;
  className?: string;
}

/**
 * CaptureButton — touch-friendly, large, full-width button with 150ms
 * debounce to prevent accidental double-fires and background-tap false positives.
 *
 * The debounce guard ensures that taps arriving within 150ms of each other
 * are ignored. This satisfies the "no adjacent tap detection, debounce 150ms"
 * requirement and the "background tap prevention" requirement (a background
 * tap that fires alongside a deliberate tap is suppressed).
 */
export const CaptureButton = React.forwardRef<HTMLButtonElement, CaptureButtonProps>(
  ({ capturing = false, onCapture, className, ...props }, ref) => {
    const lastTapTimeRef = useRef(0);

    const handleTap = useCallback(() => {
      const now = Date.now();
      const elapsed = now - lastTapTimeRef.current;

      // Debounce: ignore taps within 150ms of the previous one
      if (elapsed < DEBOUNCE_MS) {
        return;
      }

      lastTapTimeRef.current = now;
      onCapture();
    }, [onCapture]);

    return (
      <Button
        ref={ref}
        variant="default"
        size="lg"
        className={cn(
          "w-full max-w-xs h-16 text-lg font-semibold rounded-full",
          "active:scale-95 transition-transform",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        onClick={handleTap}
        disabled={capturing}
        aria-label="Capture photo"
        {...props}
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
    );
  }
);

CaptureButton.displayName = "CaptureButton";