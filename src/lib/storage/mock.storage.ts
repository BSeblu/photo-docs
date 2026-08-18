import type {
  Storage,
  StorageFile,
  StorageFileInput,
  StorageOperation,
} from "./types";

export interface MockStorageOptions {
  folders?: string[];
  files?: StorageFileInput[];
}

const normalizePath = (path: string) => path.replace(/^\/+|\/+$/g, "");

const parentPath = (path: string) => {
  const separator = path.lastIndexOf("/");
  return separator === -1 ? "" : path.slice(0, separator);
};

const fileName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

export class MockStorage implements Storage {
  private readonly files = new Map<string, StorageFile>();
  private readonly folders = new Set<string>();
  private readonly errors = new Map<StorageOperation, Error>();

  constructor(options: MockStorageOptions = {}) {
    this.folders.add("");
    for (const folder of options.folders ?? []) {
      this.addFolderAndParents(folder);
    }
    for (const file of options.files ?? []) {
      this.save(file);
    }
  }

  async save(file: StorageFileInput): Promise<StorageFile> {
    this.throwInjectedError("save");
    const path = normalizePath(file.path);
    const storedFile: StorageFile = {
      path,
      name: fileName(path),
      content: file.content,
      contentType: file.contentType ?? (file.content.type || "application/octet-stream"),
      size: file.content.size,
      lastModified: file.lastModified ?? Date.now(),
    };
    this.addFolderAndParents(parentPath(path));
    this.files.set(path, storedFile);
    return storedFile;
  }

  async list(folderPath: string): Promise<StorageFile[]> {
    this.throwInjectedError("list");
    const folder = normalizePath(folderPath);
    return [...this.files.values()].filter(
      (file) => parentPath(file.path) === folder
    );
  }

  async get(path: string): Promise<StorageFile | null> {
    this.throwInjectedError("get");
    return this.files.get(normalizePath(path)) ?? null;
  }

  async delete(path: string): Promise<void> {
    this.throwInjectedError("delete");
    this.files.delete(normalizePath(path));
  }

  async folderExists(path: string): Promise<boolean> {
    this.throwInjectedError("folderExists");
    return this.folders.has(normalizePath(path));
  }

  async createFolder(path: string): Promise<void> {
    this.throwInjectedError("createFolder");
    this.addFolderAndParents(path);
  }

  injectError(operation: StorageOperation, error: Error): void {
    this.errors.set(operation, error);
  }

  clearInjectedErrors(): void {
    this.errors.clear();
  }

  private addFolderAndParents(path: string): void {
    let current = normalizePath(path);
    while (current) {
      this.folders.add(current);
      current = parentPath(current);
    }
  }

  private throwInjectedError(operation: StorageOperation): void {
    const error = this.errors.get(operation);
    if (error) {
      throw error;
    }
  }
}
