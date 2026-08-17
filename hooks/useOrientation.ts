"use client";

import { useState, useEffect, useCallback } from "react";

type Orientation = "portrait" | "landscape";

interface OrientationInfo {
  orientation: Orientation;
  width: number;
  height: number;
}

export function useOrientation(): OrientationInfo {
  const getOrientation = useCallback((): OrientationInfo => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width < height ? "portrait" : "landscape";
    return { orientation, width, height };
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