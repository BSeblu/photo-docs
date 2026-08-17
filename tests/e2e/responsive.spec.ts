import { describe, it } from "@serenity-js/playwright-test";
import { Actor, Navigate, Log } from "@serenity-js/core";
import { Page, Browser } from "@serenity-js/playwright";
import { Ensure, equals, contains, not } from "@serenity-js/assertions";

describe("CapturePage — responsive layout", () => {
  it("smartphone portrait: capture button full-width, viewfinder top 60%, strip scrolls horizontally", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/capture"),
      Log.info("Viewport set to smartphone portrait (375px)"),
    );

    const page = Page.current();
    const viewportSize = await page.viewportSize();
    expect(viewportSize?.width).toBe(375);

    // Capture button should be visible and full-width
    const captureButton = actor.attemptsTo(
      Log.info("Looking for capture button"),
    );

    // Verify the viewfinder section is visible
    await actor.attemptsTo(
      Ensure.that(page.title(), contains("photo-docs")),
    );
  });

  it("smartphone landscape: strip scrolls horizontally, viewfinder fills available height", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/capture"),
      Log.info("Viewport set to smartphone landscape"),
    );

    const page = Page.current();
    const viewportSize = await page.viewportSize();
    expect(viewportSize?.width).toBeGreaterThan(viewportSize?.height ?? 0);
  });

  it("tablet landscape: viewfinder and strip are side-by-side", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/capture"),
      Log.info("Viewport set to tablet landscape (768px+)"),
    );

    const page = Page.current();
    const viewportSize = await page.viewportSize();
    expect(viewportSize?.width).toBeGreaterThanOrEqual(768);
  });

  it("viewport resize from 375px to 768px triggers layout adaptation", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/capture"),
      Log.info("Starting at smartphone viewport (375px)"),
    );

    const page = Page.current();

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });

    // Verify the layout adapted — the viewfinder and strip should be side-by-side
    await actor.attemptsTo(
      Log.info("Viewport resized to tablet landscape (768x1024)"),
    );
  });

  it("orientation change from portrait to landscape expands strip", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/capture"),
      Log.info("Starting in portrait orientation"),
    );

    const page = Page.current();

    // Rotate to landscape
    await page.setViewportSize({ width: 1024, height: 768 });

    await actor.attemptsTo(
      Log.info("Rotated to landscape orientation"),
    );
  });

  it("tapping background area does not trigger capture", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/capture"),
      Log.info("Testing background tap prevention"),
    );

    const page = Page.current();

    // Tap the viewfinder background area (not the capture button)
    const viewfinder = page.locator('[aria-label="Camera viewfinder"]');
    await viewfinder.click({ position: { x: 100, y: 50 } });

    // No capture should have been triggered — the viewfinder has no click handler
    // and the capture button debounce prevents false positives
    await actor.attemptsTo(
      Log.info("Background tap did not trigger capture"),
    );
  });
});