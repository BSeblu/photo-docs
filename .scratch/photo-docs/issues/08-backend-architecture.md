Label: wayfinder:research
Assignee: benjamin
Status: closed

## Question

Should the webapp backend stream photos directly to Nextcloud or temporarily store them on a server before transferring? Investigate: what Nextcloud REST API upload options exist (chunked upload, direct upload, streaming), what are the tradeoffs of direct streaming vs. temporary storage for an offline-first fullstack JS webapp that must handle background upload and connectivity drops, and which approach best fits the requirements (REST API preferred over WebDAV, session sizes of 20–50 photos, photos up to 5 MB each)?

No blockers.

## Resolution

Hybrid approach recommended: temporary local buffer + async chunked upload to Nextcloud.

**Nextcloud upload options**:
- WebDAV direct PUT — simple, non-resumable, full file in one request
- Chunked upload v2 (MKCOL → PUT chunks → MOVE assemble) — supports resumable uploads, recommended for production
- Bulk multipart upload — multiple files in a single request
- `@nextcloud/upload` npm package — wraps Nextcloud's chunked upload protocol with built-in retry

**Direct streaming vs. temporary storage tradeoffs**:
- Direct streaming (Next.js backend → Nextcloud): low latency, no local disk pressure, but fragile on connectivity drops — no retry, no progress recovery
- Temporary storage + async upload: resilient to connectivity drops, supports mid-upload retry, enables chunked/resumable uploads, allows progress tracking. Adds local disk usage (~40–250 MB/session) and an extra transfer step.
- **Recommendation**: Temporary local buffer + async chunked upload. The 40–250 MB/session is well within browser/off-device quotas. Async upload decouples capture from transfer, enabling background upload, connectivity detection, and retry per chunk.

**Storage API abstraction for mocking**:
- Define a `StorageAdapter` interface with methods: `save(photo)`, `list(folder)`, `get(id)`, `delete(id)`, `folderExists(path)`, `createFolder(path)`
- `NextcloudStorageAdapter` implements the interface using Nextcloud chunked upload + folder API
- `MockStorageAdapter` — in-memory or filesystem-backed, returns seeded folder structures as initial content, supports all error injection points (quota exceeded, network failure, auth token expiry)
- Factory pattern driven by environment variable (`STORAGE_ADAPTER=nextcloud|mock`) — injected into upload service and repository layer
- This enables: unit tests against mock, isolated frontend dev without a running Nextcloud, error condition testing (network drops, 5xx responses, quota limits) without touching production

Full findings: [research/08-backend-architecture.md](../../research/08-backend-architecture.md)
