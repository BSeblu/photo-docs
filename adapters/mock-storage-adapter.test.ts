import { describe, it, expect, beforeEach } from "vitest";
import { MockStorageAdapter } from "@/adapters/mock-storage-adapter";
import { QuotaExceededError } from "@/adapters/storage-errors";
import { NetworkTimeoutError } from "@/adapters/storage-errors";
import { AuthTokenExpiredError } from "@/adapters/storage-errors";
import { ServerError } from "@/adapters/storage-errors";
import type { StorageAdapter } from "@/adapters/storage-adapter.interface";

function makeBlob(content = "test content"): Blob {
  return new Blob([content], { type: "image/jpeg" });
}

describe("MockStorageAdapter", () => {
  let adapter: MockStorageAdapter;

  beforeEach(() => {
    adapter = new MockStorageAdapter();
  });

  // --- CRUD operations ---

  describe("save / get / delete round-trip", () => {
    it("save stores a blob and get retrieves it", async () => {
      const blob = makeBlob("hello world");
      await adapter.save("photo.jpg", blob);
      const result = await adapter.get("photo.jpg");
      expect(await result.text()).toBe("hello world");
    });

    it("get throws when file does not exist", async () => {
      await expect(adapter.get("missing.jpg")).rejects.toThrow("not found");
    });

    it("delete removes a stored file", async () => {
      await adapter.save("photo.jpg", makeBlob());
      await adapter.delete("photo.jpg");
      await expect(adapter.get("photo.jpg")).rejects.toThrow();
    });

    it("delete does not throw when file does not exist", async () => {
      await expect(adapter.delete("nonexistent.jpg")).resolves.not.toThrow();
    });
  });

  // --- list ---

  describe("list", () => {
    it("returns empty array for empty root", async () => {
      const result = await adapter.list("/");
      expect(result).toEqual([]);
    });

    it("returns top-level children of a folder", async () => {
      await adapter.save("/Photos/2026/photo1.jpg", makeBlob());
      await adapter.save("/Photos/2026/photo2.jpg", makeBlob());
      const result = await adapter.list("/Photos/2026");
      expect(result).toEqual(["photo1.jpg", "photo2.jpg"]);
    });

    it("returns children across different subfolders", async () => {
      await adapter.save("/Photos/2026/img1.jpg", makeBlob());
      await adapter.save("/Photos/2025/img2.jpg", makeBlob());
      const result = await adapter.list("/Photos");
      expect(result).toEqual(["2025", "2026"]);
    });

    it("returns empty array for folder with no children", async () => {
      await adapter.save("/Photos/2026/img.jpg", makeBlob());
      const result = await adapter.list("/Photos/2025");
      expect(result).toEqual([]);
    });
  });

  // --- folderExists / createFolder ---

  describe("folderExists / createFolder", () => {
    it("folderExists returns true for seeded folder", async () => {
      const seeded = new MockStorageAdapter({
        seededFolders: ["/Photos", "/Photos/2026"],
      });
      expect(await seeded.folderExists("/Photos")).toBe(true);
      expect(await seeded.folderExists("/Photos/2026")).toBe(true);
    });

    it("folderExists returns false for non-existent path", async () => {
      expect(await adapter.folderExists("/Nowhere")).toBe(false);
    });

    it("createFolder makes a new folder and it is found by folderExists", async () => {
      await adapter.createFolder("/Documents");
      expect(await adapter.folderExists("/Documents")).toBe(true);
    });

    it("createFolder creates parent folders automatically", async () => {
      await adapter.createFolder("/A/B/C");
      expect(await adapter.folderExists("/A")).toBe(true);
      expect(await adapter.folderExists("/A/B")).toBe(true);
      expect(await adapter.folderExists("/A/B/C")).toBe(true);
    });

    it("createFolder is idempotent for existing folder", async () => {
      await adapter.createFolder("/Photos");
      await adapter.createFolder("/Photos"); // should not throw
      expect(await adapter.folderExists("/Photos")).toBe(true);
    });
  });

  // --- seeded hierarchy ---

  describe("seeded folder hierarchy", () => {
    it("list returns seeded subfolders", async () => {
      const seeded = new MockStorageAdapter({
        seededFolders: ["/Photos", "/Photos/2026"],
      });
      const result = await seeded.list("/Photos");
      expect(result).toEqual(["2026"]);
    });

    it("handles deeply nested seeded hierarchy", async () => {
      const seeded = new MockStorageAdapter({
        seededFolders: ["/Photos/2026/June", "/Photos/2026/July"],
      });
      expect(await seeded.folderExists("/Photos")).toBe(true);
      expect(await seeded.folderExists("/Photos/2026")).toBe(true);
      const result = await seeded.list("/Photos/2026");
      expect(result).toEqual(["July", "June"]);
    });
  });

  // --- error injection ---

  describe("quota exceeded error injection", () => {
    it("save throws QuotaExceededError when quotaExceeded is enabled", async () => {
      const quotaAdapter = new MockStorageAdapter({ quotaExceeded: true });
      await expect(quotaAdapter.save("photo.jpg", makeBlob())).rejects.toThrow(
        QuotaExceededError
      );
    });

    it("other operations are not affected by quotaExceeded", async () => {
      const quotaAdapter = new MockStorageAdapter({ quotaExceeded: true });
      // list should still work
      const result = await quotaAdapter.list("/");
      expect(result).toEqual([]);
    });
  });

  describe("network timeout error injection", () => {
    it("get throws NetworkTimeoutError when networkTimeout is enabled", async () => {
      const timeoutAdapter = new MockStorageAdapter({ networkTimeout: true });
      await expect(timeoutAdapter.get("photo.jpg")).rejects.toThrow(
        NetworkTimeoutError
      );
    });

    it("save throws NetworkTimeoutError when networkTimeout is enabled", async () => {
      const timeoutAdapter = new MockStorageAdapter({ networkTimeout: true });
      await expect(timeoutAdapter.save("photo.jpg", makeBlob())).rejects.toThrow(
        NetworkTimeoutError
      );
    });

    it("list is NOT affected by networkTimeout (per spec)", async () => {
      const timeoutAdapter = new MockStorageAdapter({ networkTimeout: true });
      // list should work even with networkTimeout enabled
      const result = await timeoutAdapter.list("/");
      expect(result).toEqual([]);
    });
  });

  describe("auth token expiry error injection", () => {
    it("list throws AuthTokenExpiredError when authTokenExpired is enabled", async () => {
      const authAdapter = new MockStorageAdapter({ authTokenExpired: true });
      await expect(authAdapter.list("/")).rejects.toThrow(AuthTokenExpiredError);
    });

    it("other operations are not affected by authTokenExpired", async () => {
      const authAdapter = new MockStorageAdapter({ authTokenExpired: true });
      await authAdapter.save("photo.jpg", makeBlob());
      const result = await authAdapter.get("photo.jpg");
      expect(await result.text()).toBe("test content");
    });
  });

  describe("server error injection", () => {
    it("all operations throw ServerError when serverError is enabled", async () => {
      const serverAdapter = new MockStorageAdapter({ serverError: true });
      await expect(serverAdapter.list("/")).rejects.toThrow(ServerError);
      await expect(serverAdapter.save("x", makeBlob())).rejects.toThrow(ServerError);
      await expect(serverAdapter.get("x")).rejects.toThrow(ServerError);
      await expect(serverAdapter.delete("x")).rejects.toThrow(ServerError);
      await expect(serverAdapter.folderExists("/")).rejects.toThrow(ServerError);
      await expect(serverAdapter.createFolder("/x")).rejects.toThrow(ServerError);
    });

    it("server error includes configured status code", async () => {
      const serverAdapter = new MockStorageAdapter({
        serverError: true,
        serverErrorCode: 503,
      });
      try {
        await serverAdapter.list("/");
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(ServerError);
        expect((e as ServerError).statusCode).toBe(503);
      }
    });
  });
});