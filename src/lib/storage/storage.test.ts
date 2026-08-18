import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AuthTokenExpiredError,
  NetworkTimeoutError,
  QuotaExceededError,
} from "./errors";
import {
  createStorage,
  type StorageBackend,
  type StorageFactoryOptions,
} from "./index";
import { NextCloudStorage } from "./nextcloud.storage";
import { MockStorage } from "./mock.storage";
import type { Storage } from "./types";

const photo = (path: string) => ({
  path,
  content: new Blob(["photo"], { type: "image/jpeg" }),
});

describe("MockStorage", () => {
  it("supports saving, listing, reading, and deleting files", async () => {
    const storage: Storage = new MockStorage({ folders: ["jobs/2026"] });

    await storage.save(photo("jobs/2026/photo.jpg"));

    const files = await storage.list("jobs/2026");
    expect(files.map(({ path }) => path)).toEqual(["jobs/2026/photo.jpg"]);
    expect(await storage.get("jobs/2026/photo.jpg")).toMatchObject({
      path: "jobs/2026/photo.jpg",
      contentType: "image/jpeg",
      size: 5,
    });

    await storage.delete("jobs/2026/photo.jpg");

    expect(await storage.get("jobs/2026/photo.jpg")).toBeNull();
    expect(await storage.list("jobs/2026")).toEqual([]);
  });

  it("loads seeded folders and files", async () => {
    const storage = new MockStorage({
      folders: ["jobs/2026"],
      files: [photo("jobs/2026/seeded.jpg")],
    });

    expect(await storage.folderExists("jobs/2026")).toBe(true);
    expect(await storage.list("jobs/2026")).toHaveLength(1);
  });

  it("creates folders and reports their existence", async () => {
    const storage = new MockStorage();

    expect(await storage.folderExists("jobs/2026/august")).toBe(false);

    await storage.createFolder("jobs/2026/august");

    expect(await storage.folderExists("jobs")).toBe(true);
    expect(await storage.folderExists("jobs/2026/august")).toBe(true);
  });

  it("injects configured errors into matching operations", async () => {
    const storage = new MockStorage();
    storage.injectError("save", new QuotaExceededError());

    await expect(storage.save(photo("photo.jpg"))).rejects.toBeInstanceOf(
      QuotaExceededError
    );

    storage.injectError("get", new NetworkTimeoutError());
    await expect(storage.get("photo.jpg")).rejects.toBeInstanceOf(
      NetworkTimeoutError
    );

    storage.injectError("folderExists", new AuthTokenExpiredError());
    await expect(storage.folderExists("jobs")).rejects.toBeInstanceOf(
      AuthTokenExpiredError
    );

    storage.clearInjectedErrors();
    await expect(storage.save(photo("photo.jpg"))).resolves.toMatchObject({
      path: "photo.jpg",
    });
  });
});

describe("createStorage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates MockStorage for the mock backend", () => {
    expect(createStorage({ backend: "mock" })).toBeInstanceOf(MockStorage);
  });

  it("supports backend-specific options through the discriminant", () => {
    const options = {
      backend: "mock",
      folders: ["jobs"],
    } satisfies StorageFactoryOptions;
    const backend: StorageBackend = options.backend;

    expect(backend).toBe("mock");
    expect(createStorage(options)).toBeInstanceOf(MockStorage);
  });

  it("uses STORAGE_BACKEND when no backend option is provided", () => {
    vi.stubEnv("STORAGE_BACKEND", "mock");

    expect(createStorage()).toBeInstanceOf(MockStorage);
  });

  it("selects the Nextcloud backend", () => {
    expect(createStorage({ backend: "nextcloud" })).toBeInstanceOf(
      NextCloudStorage
    );
  });
});
