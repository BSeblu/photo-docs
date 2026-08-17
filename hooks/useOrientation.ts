"use client";

import { useState, useEffect, useCallback } from "react";

type Orientation = "portrait" | "landscape";
type Breakpoint = "small" | "medium";

interface OrientationInfo {
  orientation: Orientation;
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isSmall: boolean;
  isMedium: boolean;
}

const SMALL_BREAKPOINT = 768;

export function useOrientation(): OrientationInfo {
  const getOrientation = useCallback((): OrientationInfo => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width < height ? "portrait" : "landscape";
    const isSmall = width < SMALL_BREAKPOINT;
    const isMedium = width >= SMALL_BREAKPOINT;
    const breakpoint = isSmall ? "small" : "medium";
    return { orientation, width, height, breakpoint, isSmall, isMedium };
  }, []);

  const [info, setInfo] = useState<OrientationInfo>(getOrientation);

  useEffect(() => {
    const handleResize = () => {
      setInfo(getOrientation());
    };

    // Use both resize and orientationchange for maximum compatibility
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [getOrientation]);

  return info;
}