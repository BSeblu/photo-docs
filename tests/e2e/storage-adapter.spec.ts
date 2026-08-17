import { describe, it } from "@serenity-js/playwright-test";
import { Ensure, equals } from "@serenity-js/assertions";
import { Navigate } from "@serenity-js/web";
import { MockStorageAdapter } from "@/adapters";

describe("MockStorageAdapter Serenity/JS actor scenario", () => {
  it("saves a photo blob, lists the folder, sees the photo present", async ({ actor }) => {
    const adapter = new MockStorageAdapter({
      seededFolders: ["/Photos"],
    });
    const photoBlob = new Blob(["fake-jpeg-data"], { type: "image/jpeg" });

    await actor.attemptsTo(Navigate.to("/"));

    await adapter.save("/Photos/summer.jpg", photoBlob);
    const contents = await adapter.list("/Photos");

    await Ensure.that(contents, equals(["summer.jpg"]));
  });

  it("triggers the storage-full path and sees QuotaExceededError", async ({ actor }) => {
    const quotaAdapter = new MockStorageAdapter({
      quotaExceeded: true,
      seededFolders: ["/Photos"],
    });
    const photoBlob = new Blob(["photo-data"], { type: "image/jpeg" });

    await actor.attemptsTo(Navigate.to("/"));

    let caughtError: Error | undefined;
    try {
      await quotaAdapter.save("/Photos/full.jpg", photoBlob);
    } catch (e) {
      caughtError = e as Error;
    }

    await Ensure.that(caughtError?.name, equals("QuotaExceededError"));
  });
});