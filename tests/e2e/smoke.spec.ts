import { describe, it } from "@serenity-js/playwright-test";
import { Navigate, Page } from "@serenity-js/web";
import { Ensure, equals } from "@serenity-js/assertions";

describe("Smoke test", () => {
  it("renders the root page", async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to("/"),
      Ensure.that(Page.current().title(), equals("Create Next App")),
    );
  });
});