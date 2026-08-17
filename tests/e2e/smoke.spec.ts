import { describe, it } from "@serenity-js/playwright-test";
import { Actor, Navigate, Log } from "@serenity-js/core";
import { Page, Browser } from "@serenity-js/playwright";
import { Ensure, equals, contains } from "@serenity-js/assertions";

describe("Smoke test", () => {
  it("renders the root page", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/"),
      Ensure.that(Page.current().title(), contains("Create Next App")),
    );
  });
});