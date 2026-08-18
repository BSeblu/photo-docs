import {
  MockStorage,
  type MockStorageOptions,
} from "./mock.storage";
import {
  NextCloudStorage,
  type NextCloudStorageOptions,
} from "./nextcloud.storage";
import type { Storage } from "./types";

export type StorageOptions = MockStorageOptions | NextCloudStorageOptions;
export type StorageBackend = StorageOptions["backend"];

export function createStorage(options?: StorageOptions): Storage {
  if (options?.backend === "mock") {
    return new MockStorage({
      folders: options.folders,
      files: options.files,
    });
  }

  if (options?.backend === "nextcloud") {
    return new NextCloudStorage(options);
  }

  const backend = process.env.STORAGE_BACKEND ?? "mock";
  if (backend === "mock") {
    return new MockStorage();
  }

  if (backend === "nextcloud") {
    return new NextCloudStorage({ backend });
  }

  throw new Error(`Unsupported storage backend: ${backend}`);
}

export {
  AuthTokenExpiredError,
  NetworkTimeoutError,
  QuotaExceededError,
  ServerError,
} from "./errors";
export {
  MockStorage,
  type MockStorageConfig,
  type MockStorageOptions,
} from "./mock.storage";
export {
  NextCloudStorage,
  type NextCloudStorageOptions,
} from "./nextcloud.storage";
export type {
  Storage,
  StorageFile,
  StorageFileInput,
  StorageOperation,
} from "./types";
