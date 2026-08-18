export interface StorageFileInput {
  path: string;
  content: Blob;
  contentType?: string;
  lastModified?: number;
}

export interface StorageFile {
  path: string;
  name: string;
  content: Blob;
  contentType: string;
  size: number;
  lastModified: number;
}

export type StorageOperation =
  | "save"
  | "list"
  | "get"
  | "delete"
  | "folderExists"
  | "createFolder";

export interface Storage {
  save(file: StorageFileInput): Promise<StorageFile>;
  list(folderPath: string): Promise<StorageFile[]>;
  get(path: string): Promise<StorageFile | null>;
  delete(path: string): Promise<void>;
  folderExists(path: string): Promise<boolean>;
  createFolder(path: string): Promise<void>;
}
