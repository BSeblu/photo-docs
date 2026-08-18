# 11 — Storage interface and MockStorage

**What to build:** A `Storage` interface defining common file and folder operations (`save`, `list`, `get`, `delete`, `folderExists`, `createFolder`), paired with an in-memory `MockStorage` implementation with pre-seeded test folders and error injection controls (network drop, quota exceeded, auth failure). A factory creates the appropriate backend according to the `STORAGE_BACKEND` environment variable.

**Blocked by:** 10b — Unit testing setup

**Status:** closed

- [x] `Storage` TypeScript interface defined in `src/lib/storage/types.ts` with standard folder and file CRUD methods
- [x] `MockStorage` implements `Storage` in `src/lib/storage/mock.storage.ts` with configurable seeded folder hierarchy
- [x] `MockStorage` provides hooks to simulate failures (quota exceeded, network timeouts, auth errors)
- [x] `createStorage()` factory in `src/lib/storage/index.ts` selects backend via `STORAGE_BACKEND=mock|nextcloud`
- [x] Barrel export from `src/lib/storage/index.ts`
- [x] Unit tests verify `MockStorage` behavior and error simulation
