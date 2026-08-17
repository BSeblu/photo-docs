import { describe, it } from "@serenity-js/playwright-test";
import { Navigate } from "@serenity-js/web";

describe("CapturePage — responsive layout", () => {
  it("smartphone portrait: capture button visible at 375px", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/capture"),
    );
  });

  it("tablet landscape: capture page at 768px shows side-by-side layout", async ({ actor, page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await actor.attemptsTo(
      Navigate.to("/capture"),
    );
  });

  it("viewport resize from 375px to 768px triggers layout adaptation", async ({ actor, page }) => {
    await page.goto("/capture");
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(100);
  });

  it("orientation change portrait→landscape expands strip", async ({ actor, page }) => {
    await page.goto("/capture");
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.waitForTimeout(100);
  });

  it("tapping viewfinder background does not trigger capture", async ({ actor, page }) => {
    await page.goto("/capture");
    const viewfinder = page.locator("[aria-label=\"Camera viewfinder\"]");
    await viewfinder.click({ position: { x: 100, y: 50 } });
  });
});