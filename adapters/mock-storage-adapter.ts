import {
  QuotaExceededError,
  NetworkTimeoutError,
  AuthTokenExpiredError,
  ServerError,
} from "./storage-errors";
import type { StorageAdapter } from "./storage-adapter.interface";

export interface MockStorageAdapterOptions {
  /** Seeded folder hierarchy: each entry is a folder path slashes-separated.
   *  Example: ["/Photos/2026", "/Photos/2025", "/Documents"] */
  seededFolders?: string[];
  /** Delay in ms to inject before each operation (simulates network latency). */
  networkDelayMs?: number;
  /** If true, quota is exceeded on every save. */
  quotaExceeded?: boolean;
  /** If true, all operations throw NetworkTimeoutError after networkDelayMs. */
  networkTimeout?: boolean;
  /** If true, all list operations throw AuthTokenExpiredError. */
  authTokenExpired?: boolean;
  /** If true, all operations throw ServerError with the configured statusCode. */
  serverError?: boolean;
  /** HTTP status code to use for server errors (default 500). */
  serverErrorCode?: number;
}

export class MockStorageAdapter implements StorageAdapter {
  private store: Map<string, { blob: Blob; meta: Record<string, unknown> }>;
  private options: Required<MockStorageAdapterOptions>;

  constructor(options: MockStorageAdapterOptions = {}) {
    this.store = new Map();
    this.options = {
      seededFolders: options.seededFolders ?? [],
      networkDelayMs: options.networkDelayMs ?? 0,
      quotaExceeded: options.quotaExceeded ?? false,
      networkTimeout: options.networkTimeout ?? false,
      authTokenExpired: options.authTokenExpired ?? false,
      serverError: options.serverError ?? false,
      serverErrorCode: options.serverErrorCode ?? 500,
    };

    this.seedFolders();
  }

  private seedFolders(): void {
    for (const folder of this.options.seededFolders) {
      const normalized = this.normalizePath(folder);
      if (!this.store.has(normalized)) {
        this.store.set(normalized, { blob: new Blob([]), meta: { type: "folder" } });
      }
    }
    // Ensure every parent folder in the hierarchy exists too.
    for (const folder of this.options.seededFolders) {
      const parts = folder.split("/").filter(Boolean);
      let current = "";
      for (const part of parts) {
        current += `/${part}`;
        const normalized = this.normalizePath(current);
        if (!this.store.has(normalized)) {
          this.store.set(normalized, { blob: new Blob([]), meta: { type: "folder" } });
        }
      }
    }
  }

  private async maybeDelay(): Promise<void> {
    if (this.options.networkDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.options.networkDelayMs));
    }
  }

  private async maybeThrowError(operation: string): Promise<void> {
    if (this.options.serverError) {
      throw new ServerError(`Server error simulated (${operation})`, this.options.serverErrorCode);
    }
    if (this.options.networkTimeout && operation !== "list") {
      throw new NetworkTimeoutError(`Network timeout on ${operation}`);
    }
    if (this.options.authTokenExpired && operation === "list") {
      throw new AuthTokenExpiredError("Auth token expired (401)");
    }
    if (this.options.quotaExceeded && operation === "save") {
      throw new QuotaExceededError("Storage quota exceeded on save");
    }
  }

  private normalizePath(path: string): string {
    return path.endsWith("/") ? path.slice(0, -1) : path;
  }

  private parentPath(path: string): string {
    const normalized = this.normalizePath(path);
    const lastSlash = normalized.lastIndexOf("/");
    if (lastSlash <= 0) return "/";
    return normalized.slice(0, lastSlash) || "/";
  }

  async save(name: string, blob: Blob): Promise<void> {
    await this.maybeDelay();
    await this.maybeThrowError("save");
    const key = this.normalizePath(name);
    this.store.set(key, { blob, meta: { type: "file" } });
  }

  async list(path: string): Promise<string[]> {
    await this.maybeDelay();
    await this.maybeThrowError("list");
    const normalized = this.normalizePath(path);
    const prefix = normalized === "/" ? "/" : normalized + "/";
    const children = new Set<string>();
    for (const key of this.store.keys()) {
      if (key === normalized) continue;
      if (key.startsWith(prefix)) {
        const rest = key.slice(prefix.length);
        const nextSlash = rest.indexOf("/");
        const child = nextSlash === -1 ? rest : rest.slice(0, nextSlash);
        if (child) children.add(child);
      }
    }
    return Array.from(children).sort();
  }

  async get(name: string): Promise<Blob> {
    await this.maybeDelay();
    await this.maybeThrowError("get");
    const key = this.normalizePath(name);
    const entry = this.store.get(key);
    if (!entry) {
      throw new Error(`File not found: ${name}`);
    }
    return entry.blob;
  }

  async delete(name: string): Promise<void> {
    await this.maybeDelay();
    await this.maybeThrowError("delete");
    const key = this.normalizePath(name);
    this.store.delete(key);
  }

  async folderExists(path: string): Promise<boolean> {
    await this.maybeDelay();
    await this.maybeThrowError("folderExists");
    const key = this.normalizePath(path);
    const entry = this.store.get(key);
    return entry !== undefined && (entry.meta.type === "folder" || entry.blob.size === 0);
  }

  async createFolder(path: string): Promise<void> {
    await this.maybeDelay();
    await this.maybeThrowError("createFolder");
    const key = this.normalizePath(path);
    this.store.set(key, { blob: new Blob([]), meta: { type: "folder" } });

    // Seed parent directories too.
    const parts = path.split("/").filter(Boolean);
    let current = "";
    for (const part of parts) {
      current += `/${part}`;
      const parentKey = this.normalizePath(current);
      if (!this.store.has(parentKey)) {
        this.store.set(parentKey, { blob: new Blob([]), meta: { type: "folder" } });
      }
    }
  }
}