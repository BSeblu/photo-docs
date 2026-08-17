import { MockStorageAdapter } from "./mock-storage-adapter";
import type { StorageAdapter } from "./storage-adapter.interface";

export class StorageAdapterFactory {
  static create(): StorageAdapter {
    const adapter = process.env.STORAGE_ADAPTER ?? "mock";
    switch (adapter) {
      case "mock":
        return new MockStorageAdapter();
      case "nextcloud":
        throw new Error(
          "NextcloudStorageAdapter is not yet implemented (see ticket t_12)"
        );
      default:
        throw new Error(
          `Unknown STORAGE_ADAPTER value: ${adapter}. Use "mock" or "nextcloud".`
        );
    }
  }
}

export { MockStorageAdapter } from "./mock-storage-adapter";
export type { StorageAdapter } from "./storage-adapter.interface";
export {
  QuotaExceededError,
  NetworkTimeoutError,
  AuthTokenExpiredError,
  ServerError,
} from "./storage-errors";