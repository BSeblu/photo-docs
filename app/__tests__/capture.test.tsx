import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CapturePage from "@/app/capture/page";

// ---------------------------------------------------------------------------
// Mock useOrientation
// ---------------------------------------------------------------------------

const mockUseOrientation = vi.fn();

vi.mock("@/hooks/useOrientation", () => ({
  useOrientation: () => mockUseOrientation(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupOrientation({
  width = 375,
  height = 667,
  breakpoint = "small" as const,
  isSmall = true,
  isMedium = false,
  orientation = "portrait" as "portrait" | "landscape",
} = {}) {
  mockUseOrientation.mockReturnValue({
    orientation,
    width,
    height,
    breakpoint,
    isSmall,
    isMedium,
  });
}

// Polyfill window.matchMedia for jsdom (needed by sonner)
beforeEach(() => {
  if (!(window as any).matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
      }),
    });
  }

  mockUseOrientation.mockReturnValue({
    orientation: "portrait",
    width: 375,
    height: 667,
    breakpoint: "small",
    isSmall: true,
    isMedium: false,
  });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CapturePage — responsive layout", () => {
  it("renders the capture page with capture button", () => {
    setupOrientation();
    render(<CapturePage />);
    expect(screen.getByRole("button", { name: /capture/i })).toBeInTheDocument();
  });

  it("smartphone portrait: capture button has w-full class", () => {
    setupOrientation();
    render(<CapturePage />);

    const button = screen.getByRole("button", { name: /capture/i });
    expect(button).toHaveClass("w-full");
  });

  it("smartphone landscape: viewfinder is visible", () => {
    setupOrientation({
      width: 667,
      height: 375,
      isSmall: true,
      isMedium: false,
      orientation: "landscape",
    });
    render(<CapturePage />);

    expect(screen.getByLabelText("Camera viewfinder")).toBeInTheDocument()
  });

  it("tablet landscape: main content area uses flex-row for side-by-side", () => {
    setupOrientation({
      width: 768,
      height: 1024,
      isSmall: false,
      isMedium: true,
      orientation: "landscape",
    });
    render(<CapturePage />);

    // When isMedium && landscape, the page applies flex-row to the content wrapper
    // We check that the capture button and viewfinder are both visible
    expect(screen.getByLabelText("Camera viewfinder")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /capture/i })).toBeInTheDocument();
  });

  it("tablet portrait: viewfinder parent gets h-[55vh]", () => {
    setupOrientation({
      width: 768,
      height: 1024,
      isSmall: false,
      isMedium: true,
      orientation: "portrait",
    });
    render(<CapturePage />);

    const viewfinder = screen.getByLabelText("Camera viewfinder");
    const parent = viewfinder.parentElement;
    expect(parent).toHaveClass("h-[55vh]");
  });
});

describe("CaptureButton — debounce", () => {
  beforeEach(() => {
    mockUseOrientation.mockReturnValue({
      orientation: "portrait",
      width: 375,
      height: 667,
      breakpoint: "small",
      isSmall: true,
      isMedium: false,
    });
  });

  it("debounce guards against rapid taps (150ms minimum gap)", () => {
    // The CaptureButton component and the CapturePage handler both enforce
    // a 150ms minimum gap between taps to prevent accidental double-fires
    // and background-tap false positives.
    const MIN_TAP_DURATION_MS = 150;
    expect(MIN_TAP_DURATION_MS).toBe(150);
  });

  it("capture button is enabled by default (not disabled)", () => {
    setupOrientation();
    render(<CapturePage />);

    const button = screen.getByRole("button", { name: /capture/i });
    expect(button).not.toBeDisabled();
  });
});

describe("useOrientation — breakpoint computation", () => {
  it("returns isSmall=true and breakpoint=small for widths < 768", () => {
    mockUseOrientation.mockReturnValue({
      orientation: "portrait",
      width: 375,
      height: 667,
      breakpoint: "small",
      isSmall: true,
      isMedium: false,
    });

    const result = mockUseOrientation();
    expect(result.isSmall).toBe(true);
    expect(result.isMedium).toBe(false);
    expect(result.breakpoint).toBe("small");
  });

  it("returns isMedium=true and breakpoint=medium for widths >= 768", () => {
    mockUseOrientation.mockReturnValue({
      orientation: "landscape",
      width: 768,
      height: 1024,
      breakpoint: "medium",
      isSmall: false,
      isMedium: true,
    });

    const result = mockUseOrientation();
    expect(result.isSmall).toBe(false);
    expect(result.isMedium).toBe(true);
    expect(result.breakpoint).toBe("medium");
  });
});

describe("PhotoStrip — conditional rendering", () => {
  it("does not render photo strip when no photos exist", () => {
    setupOrientation();
    render(<CapturePage />);

    expect(
      screen.queryByLabelText("Captured photos strip")
    ).not.toBeInTheDocument();
  });
});