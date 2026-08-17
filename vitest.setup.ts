import "@testing-library/jest-dom";

// Polyfill window.matchMedia for jsdom (needed by sonner and next-themes)
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null as unknown,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});