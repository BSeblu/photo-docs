# 15 — Upload service and batch submission

**What to build:** An upload service that coordinates taking selected photos from the active session and executing chunked batch uploads to the target folder via the active `StorageAdapter`. Provides per-photo progress state and batch completion summary toasts.

**Blocked by:** 12 — NextcloudStorageAdapter implementation, 13 — Camera capture pipeline

**Status:** ready-for-agent

- [ ] Submitting a session queues all selected photos for upload to the current Nextcloud folder
- [ ] Uploads execute asynchronously via the active `StorageAdapter`
- [ ] Per-photo progress indicators show current status (queued, uploading, done, failed)
- [ ] Batch completion toast displays summary (e.g. "X of Y photos uploaded successfully")
- [ ] Rejected photos in the session are discarded upon submit
