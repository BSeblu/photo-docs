# 11 — StorageAdapter interface and MockStorageAdapter

**What to build:** An abstraction interface `StorageAdapter` defining common file and folder operations (`save`, `list`, `get`, `delete`, `folderExists`, `createFolder`), paired with an in-memory/filesystem `MockStorageAdapter` with pre-seeded test folders and error injection controls (network drop, quota exceeded, auth failure). A factory creates the appropriate adapter according to the `STORAGE_ADAPTER` environment variable.

**Blocked by:** 10 — Next.js project scaffolding with ShadCN and test runner

**Status:** ready-for-agent

- [ ] `StorageAdapter` TypeScript interface defined with standard folder and file CRUD methods
- [ ] `MockStorageAdapter` implements `StorageAdapter` with configurable seeded folder hierarchy
- [ ] `MockStorageAdapter` provides hooks to simulate failures (quota exceeded, network timeouts, auth errors)
- [ ] Factory / provider selects adapter via `STORAGE_ADAPTER=mock|nextcloud`
- [ ] Unit tests verify `MockStorageAdapter` behavior and error simulation
