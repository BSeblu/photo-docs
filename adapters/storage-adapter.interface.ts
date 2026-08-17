export interface StorageAdapter {
  save(name: string, blob: Blob): Promise<void>;
  list(path: string): Promise<string[]>;
  get(name: string): Promise<Blob>;
  delete(name: string): Promise<void>;
  folderExists(path: string): Promise<boolean>;
  createFolder(path: string): Promise<void>;
}