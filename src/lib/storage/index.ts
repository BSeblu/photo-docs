import { MockStorage, type MockStorageOptions } from "./mock.storage";
import type { Storage } from "./types";

export type StorageBackend = "mock" | "nextcloud";

export interface StorageFactoryOptions {
  backend?: StorageBackend;
  mock?: MockStorageOptions;
}

export function createStorage(options: StorageFactoryOptions = {}): Storage {
  const backend = options.backend ?? process.env.STORAGE_BACKEND ?? "mock";

  if (backend === "mock") {
    return new MockStorage(options.mock);
  }

  if (backend === "nextcloud") {
    throw new Error("NextCloudStorage is not available until ticket 12");
  }

  throw new Error(`Unsupported storage backend: ${backend}`);
}

export {
  AuthTokenExpiredError,
  NetworkTimeoutError,
  QuotaExceededError,
  ServerError,
} from "./errors";
export { MockStorage } from "./mock.storage";
export type {
  Storage,
  StorageFile,
  StorageFileInput,
  StorageOperation,
} from "./types";
