# 12 — NextcloudStorageAdapter implementation

**What to build:** A production `NextcloudStorageAdapter` implementing the `StorageAdapter` interface against Nextcloud's REST API using Nextcloud client libraries (e.g. `@nextcloud/upload` or client packages). Supports chunked resumable upload, folder querying, and auto-renaming on conflict.

**Blocked by:** 11 — StorageAdapter interface and MockStorageAdapter

**Status:** ready-for-agent

- [ ] `NextcloudStorageAdapter` implements the `StorageAdapter` interface
- [ ] Integrates Nextcloud client library / REST API for chunked resumable upload
- [ ] Implements folder creation, listing, and existence checks
- [ ] Detects name collisions and auto-appends numerical suffix (e.g. `photo (1).jpg`)
- [ ] Unit/mock integration tests verify adapter against simulated Nextcloud REST responses
