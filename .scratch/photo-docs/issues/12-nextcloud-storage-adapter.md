# 12 — NextCloudStorage implementation

**What to build:** A production `NextCloudStorage` implementing the `Storage` interface against NextCloud's REST API using NextCloud client libraries (e.g. `@nextcloud/upload` or client packages). Supports chunked resumable upload, folder querying, and auto-renaming on conflict.

**Blocked by:** 11 — Storage interface and MockStorage

**Status:** ready-for-agent

- [ ] `NextCloudStorage` implements the `Storage` interface in `src/lib/storage/nextcloud.storage.ts`
- [ ] Integrates NextCloud client library / REST API for chunked resumable upload
- [ ] Implements folder creation, listing, and existence checks
- [ ] Detects name collisions and auto-appends numerical suffix (e.g. `photo (1).jpg`)
- [ ] Unit/mock integration tests verify storage against simulated NextCloud REST responses
