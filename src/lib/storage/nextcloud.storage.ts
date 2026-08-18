import type { Storage, StorageFile, StorageFileInput } from "./types";

export interface NextCloudStorageOptions {
  backend: "nextcloud";
}

const unavailable = () =>
  new Error("NextCloudStorage operations are implemented in ticket 12");

/** Temporary backend seam; ticket 12 supplies the Nextcloud REST implementation. */
export class NextCloudStorage implements Storage {
  constructor(_options?: NextCloudStorageOptions) {}

  async save(_file: StorageFileInput): Promise<StorageFile> {
    throw unavailable();
  }

  async list(_folderPath: string): Promise<StorageFile[]> {
    throw unavailable();
  }

  async get(_path: string): Promise<StorageFile | null> {
    throw unavailable();
  }

  async delete(_path: string): Promise<void> {
    throw unavailable();
  }

  async folderExists(_path: string): Promise<boolean> {
    throw unavailable();
  }

  async createFolder(_path: string): Promise<void> {
    throw unavailable();
  }
}
