# Backend Architecture: Next.js Fullstack Photo Uploader to Nextcloud

## Research Date
2026-08-17

## Research Question
Should the webapp backend stream photos directly to Nextcloud or temporarily store them on a server before transferring?

---

## 1. Nextcloud REST API Upload Options

### 1.1 WebDAV Direct Upload (PUT)

Nextcloud exposes a WebDAV endpoint for file operations. The base URL for authenticated file operations is:

```
{server}/remote.php/dav/files/{user}/path/to/file
```

A direct upload is a single `PUT` request with the raw file contents as the request body [1]:

```
PUT /remote.php/dav/files/{user}/path/to/file
```

- Any existing file is overwritten by the request [1].
- Authentication is via Basic Auth header or session cookies [1].
- Optional headers: `X-OC-MTime` (modification time), `X-OC-CTime` (creation time), `OC-Checksum`, `OC-Total-Length`, `X-NC-WebDAV-AutoMkcol` (auto-create parent dirs, since Nextcloud 32) [1].
- Response headers include `OC-Etag`, `OC-FileId`, `X-NC-OwnerId`, `X-NC-Permissions` [1].

**Relevance to our use case:** For photos up to ~5MB, a direct PUT is a single request with no chunking overhead. This is the simplest upload path.

### 1.2 Chunked Upload v2 (Recommended)

Nextcloud provides a chunked upload API (v2, the recommended version) for large files or unreliable connections [2].

**Base endpoint:**
```
{server}/remote.php/dav/uploads/{userid}
```

**Step 1 — Create upload folder (MKCOL):**
```
MKCOL /remote.php/dav/uploads/{userid}/{unique-folder-name}
Destination: {server}/remote.php/dav/files/{user}/dest/file.zip
```

The `Destination` header specifies the final target path. A random UUID for the folder name gives negligible collision risk [2].

**Step 2 — Upload chunks (PUT):**
```
PUT /remote.php/dav/uploads/{userid}/{unique-folder-name}/{chunk-number}
Destination: {server}/remote.php/dav/files/{user}/dest/file.zip
OC-Total-Length: {total-file-size}
```

Constraints [2]:
- Chunk numbering: 1 to 10000
- Chunk size: 5MB to 5GB (except the last chunk, which can be smaller)
- `OC-Total-Length` header enables quota checking — the server returns `507 Insufficient Storage` early if the user lacks space
- Chunks are assembled in numeric order

**Step 3 — Assemble chunks (MOVE):**
```
MOVE /remote.php/dav/uploads/{userid}/{unique-folder-name}/.file
Destination: {server}/remote.php/dav/files/{user}/dest/file.zip
OC-Total-Length: {total-file-size}
```

The server assembles the chunks and moves the final file to the destination. The temporary upload folder and chunks are deleted afterwards [2].

**Step 4 — Abort (DELETE):**
```
DELETE /remote.php/dav/uploads/{userid}/{unique-folder-name}/
```

**Additional headers for assembly** [2]:
- `X-OC-Mtime`: Set modification time as Unix timestamp
- `OC-Total-Length`: Required for quota checking

**Chunk expiry:** Nextcloud expires the upload directory after 24 hours of inactivity [2].

### 1.3 Bulk Upload (Multipart)

For uploading many small files in a single request, Nextcloud supports a bulk upload API [3]:

```
POST /remote.php/dav/bulk
Content-Type: multipart/related; boundary={boundary}
```

Each file is sent as one HTTP part within the multipart body, with per-part headers:
- `X-File-Path`: destination file path
- `X-File-Md5`: MD5 checksum
- `X-File-Mtime`: modification time
- `Content-Length`: file size
- `Content-Type`: MIME type

The response is a JSON document mapping file paths to results (etag, error status) [3].

### 1.4 Client-Side: `@nextcloud/upload` npm Package

The `@nextcloud/upload` package (v1.11.1) provides a client-side uploader with built-in chunking, retry logic, progress tracking, and conflict resolution [4][5].

Key capabilities [4]:
- **Chunked upload** with automatic retry (default 5 retries)
- **Progress tracking** via `Upload` class events and `Eta` class for speed/ETA estimation
- **Conflict resolution** via `openConflictPicker` and `batchUpload` with a callback
- **Queue management** with pause/resume
- **Direct upload** (non-chunked) for smaller files
- Uses `@nextcloud/axios` for HTTP requests and `axios-retry` for retry logic

The `Uploader.upload()` method handles both chunked and non-chunked uploads based on file size and server capabilities [5].

### 1.5 Summary of Upload Endpoints

| Method | Endpoint | Use Case |
|--------|----------|----------|
| PUT | `/remote.php/dav/files/{user}/path` | Direct upload (single request) |
| MKCOL | `/remote.php/dav/uploads/{user}/{folder}` | Start chunked upload |
| PUT | `/remote.php/dav/uploads/{user}/{folder}/{chunk}` | Upload a chunk |
| MOVE | `/remote.php/dav/uploads/{user}/{folder}/.file` | Assemble chunks |
| DELETE | `/remote.php/dav/uploads/{user}/{folder}/` | Abort chunked upload |
| POST | `/remote.php/dav/bulk` | Bulk upload (multipart) |

---

## 2. Direct Streaming vs. Temporary Storage Tradeoffs

### 2.1 Architecture A: Direct Streaming (Server-to-Server)

In this pattern, the Next.js API route receives the photo from the client, then immediately streams it to Nextcloud via WebDAV PUT or chunked upload, without persisting it to disk.

**How it works:**
1. Client uploads photo to Next.js API route (e.g., `POST /api/photos/upload`)
2. The route handler reads the request body as a stream (Node.js `ReadableStream` or `FormData`)
3. The handler pipes the stream directly to the Nextcloud WebDAV endpoint using an HTTP client (e.g., `axios` with streaming support, or Node.js `http`/`https` modules)
4. The Next.js route returns a success/failure response to the client

**Pros:**
- **Minimal server disk I/O** — no temporary files are written, reducing disk wear and storage requirements on the API server
- **Lower latency** — the photo travels directly from client → Next.js → Nextcloud without an intermediate disk write/read cycle
- **Simpler deployment** — no need to manage temporary file storage, cleanup, or disk space on the API server
- **Stateless API server** — the Next.js backend can be horizontally scaled without shared filesystem concerns; each request is self-contained
- **Lower total storage cost** — no duplicate storage of photos on the API server

**Cons:**
- **No retry resilience** — if the connection to Nextcloud drops mid-upload, the entire upload fails and the client must retry from the beginning (unless the client implements its own retry with chunked upload)
- **Memory pressure** — the Next.js server must buffer the entire request body in memory or manage backpressure carefully; for 50 concurrent 5MB uploads, that's up to 250MB of in-flight data
- **Tight coupling** — the upload speed is bounded by the Next.js server's outbound bandwidth to Nextcloud; if the Next.js server has limited network capacity, it becomes a bottleneck
- **No pre-transfer validation** — the photo cannot be inspected (e.g., for corruption, metadata extraction, or size checks) before committing to Nextcloud
- **Connection timeout risk** — if the Next.js-to-Nextcloud connection is slow or unstable, the request may time out before the upload completes

### 2.2 Architecture B: Temporary Storage Before Transfer

In this pattern, the Next.js API route receives the photo, saves it to a temporary location (filesystem or in-memory), and then transfers it to Nextcloud in a background process.

**How it works:**
1. Client uploads photo to Next.js API route
2. The route handler saves the photo to a temporary directory (e.g., `/tmp/photo-docs-uploads/`) or in-memory buffer
3. The route returns an immediate acknowledgment to the client
4. A background worker (e.g., a queue consumer, setImmediate, or cron) picks up the temporary file and transfers it to Nextcloud via WebDAV
5. On successful transfer, the temporary file is deleted

**Pros:**
- **Resilient to connectivity drops** — if the Nextcloud connection fails, the temporary file persists and can be retried later without requiring the client to re-upload
- **Decoupled transfer** — the client gets an immediate response; the actual Nextcloud transfer happens asynchronously, improving perceived performance
- **Pre-transfer validation** — the photo can be inspected (size, format, corruption check, metadata extraction) before committing to Nextcloud
- **Retry with backoff** — failed transfers can be retried with exponential backoff without client involvement
- **Batch optimization** — multiple photos can be queued and transferred in bulk (using the bulk upload API), reducing HTTP overhead
- **Background processing** — the Next.js route handler returns quickly, freeing the event loop for other requests

**Cons:**
- **Disk I/O overhead** — every photo is written to disk and then read back, doubling I/O and adding latency
- **Storage requirements** — temporary storage must accommodate the full session volume (40–250MB for 20–50 photos) plus overhead for concurrent sessions
- **State management** — the API server must track which temporary files belong to which session/user, and clean up stale files
- **Horizontal scaling complexity** — if the Next.js backend is scaled across multiple instances, temporary files are local to one instance; a background worker on another instance cannot access them (requires shared storage like NFS or S3)
- **Cleanup complexity** — failed transfers or abandoned sessions leave orphaned temporary files that must be cleaned up (cron job, TTL-based eviction)
- **Disk space exhaustion** — if uploads accumulate faster than they're transferred (e.g., Nextcloud is down), the temporary disk fills up

### 2.3 Analysis for Our Use Case

Given the constraints from the project context [6]:
- Each photo: up to ~5MB
- Session: 20–50 photos (40–250MB total)
- Must handle connectivity drops and retry mid-upload
- Fullstack Next.js app (API routes / route handlers)

**The connectivity resilience requirement is the decisive factor.** The project explicitly requires handling connectivity drops and retrying mid-upload [6]. This strongly favors Architecture B (temporary storage), because:

1. **Chunked upload + temporary storage** provides the best of both worlds: store the photo locally, then use Nextcloud's chunked upload API to transfer it with built-in retry and resume capability. If a chunk fails, only that chunk is retransmitted, not the entire photo.
2. **Direct streaming** makes mid-upload retry extremely difficult — if the connection drops during a direct PUT, the entire upload must be restarted from the client.
3. **The 40–250MB session size** is manageable for temporary storage on a modern server, especially with a dedicated `/tmp` mount or tmpfs.

**However**, there's a hybrid approach that combines the strengths of both:

### 2.4 Recommended Hybrid Approach

1. **Client → Next.js API route**: Client uploads the photo to the Next.js route handler. The handler reads the request body as a stream.
2. **Next.js → Temporary storage**: The stream is piped to a temporary file on the local filesystem (or tmpfs). The file is associated with the user's session.
3. **Background transfer**: A background process (using `node-cron`, a worker thread, or a simple in-process queue) picks up the temporary file and transfers it to Nextcloud using the **chunked upload v2 API**.
4. **Chunked upload with retry**: The chunked upload API provides built-in resumption — if a chunk fails, only that chunk is retransmitted. The `@nextcloud/upload` npm package handles this automatically [5].
5. **Cleanup**: On successful assembly, the temporary file is deleted. On failure, the file persists for retry. Stale files are cleaned up by a TTL-based sweeper.

**Why this hybrid approach wins:**
- **Resilience**: Chunked upload handles mid-transfer failures gracefully; temporary storage ensures the photo isn't lost if the Next.js server restarts
- **Scalability**: The Next.js route handler returns immediately; transfer happens asynchronously
- **Efficiency**: Chunked upload maximizes bandwidth usage and handles network instability
- **Simplicity**: The temporary file is a simple local file; no complex queue infrastructure needed for a single-server deployment
- **Session management**: The 40–250MB per-session footprint is well within the capacity of a tmpfs mount or a dedicated temp directory with a TTL sweeper

---

## 3. Storage API Abstraction for Mocking

### 3.1 Design Goals

The storage adapter abstraction must:
1. Abstract the Nextcloud storage API behind a clean interface/contract
2. Allow swapping in a mock storage implementation (in-memory or filesystem-based) with folder structures as initial content
3. Enable unit testing, isolated frontend development, and error condition testing without touching production Nextcloud
4. Work within a Next.js fullstack app (API routes / route handlers)

### 3.2 Architecture: Repository + Adapter Pattern

The recommended pattern combines the **Repository Pattern** (for data access abstraction) with the **Adapter Pattern** (for protocol translation) [7][8].

```
┌─────────────────────────────────────────┐
│          Application Logic              │
│  (API routes, services, use cases)     │
├─────────────────────────────────────────┤
│          Storage Interface              │
│  (abstract contract)                   │
│  - storePhoto(sessionId, photo)        │
│  - getPhoto(sessionId, photoId)        │
│  - listPhotos(sessionId)               │
│  - deletePhoto(sessionId, photoId)     │
│  - submitPhotos(sessionId)             │
├──────────────┬──────────────────────────┤
│              │                          │
├──────────────┴──────────────────────────┤
│         Adapter Layer                   │
│  (implements the interface)            │
│                                       │
│  ┌──────────────────┐  ┌────────────┐ │
│  │ NextcloudStorage  │  │ MockStorage│ │
│  │ Adapter           │  │ Adapter    │ │
│  │                   │  │            │ │
│  │ - WebDAV client   │  │ - In-memory│ │
│  │ - Chunked upload  │  │ - FS-based │ │
│  │ - Auth handling   │  │ - Folder   │ │
│  │ - Retry logic     │  │   structure│ │
│  └──────────────────┘  └────────────┘ │
├─────────────────────────────────────────┤
│          Dependency Injection           │
│  (Next.js provides the adapter at      │
│   request time or via module scope)    │
└─────────────────────────────────────────┘
```

### 3.3 Interface Definition

```typescript
// lib/storage/StorageAdapter.ts

interface PhotoRecord {
  id: string;
  sessionId: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt?: Date;
  nextcloudPath?: string;
}

interface StorageAdapter {
  // Store a photo temporarily (for the hybrid approach)
  storePhoto(sessionId: string, photo: Buffer | ReadableStream, fileName: string): Promise<PhotoRecord>;

  // Retrieve a stored photo
  getPhoto(sessionId: string, photoId: string): Promise<Buffer | ReadableStream>;

  // List photos in a session
  listPhotos(sessionId: string): Promise<PhotoRecord[]>;

  // Delete a stored photo
  deletePhoto(sessionId: string, photoId: string): Promise<void>;

  // Transfer all photos in a session to Nextcloud
  submitPhotos(sessionId: string): Promise<SubmitResult>;

  // Clean up stale temporary files
  cleanup(sessionId: string): Promise<void>;
}

interface SubmitResult {
  success: boolean;
  uploaded: PhotoRecord[];
  failed: PhotoRecord[];
  errors: Record<string, string>;
}
```

### 3.4 Nextcloud Adapter Implementation

The `NextcloudStorageAdapter` implements `StorageAdapter` by:

1. **Temporary storage**: Writing incoming photos to a local temp directory (e.g., `/tmp/photo-docs/{sessionId}/`)
2. **Chunked upload**: Using the `@nextcloud/upload` npm package or raw WebDAV requests to transfer photos to Nextcloud via the chunked upload v2 API
3. **Auth**: Reusing Nextcloud session cookies or an app password for Basic Auth [1]
4. **Retry**: Leveraging the chunked upload API's built-in resume capability — each chunk is independent, so a failed chunk can be re-uploaded without restarting the entire file
5. **Folder structure**: Creating the target folder path in Nextcloud using `MKCOL` before uploading [1]

Key implementation details:
- Use `axios` with `responseType: 'stream'` for piping the temporary file to Nextcloud
- For chunked uploads, create the upload folder with `MKCOL`, upload chunks with `PUT`, and assemble with `MOVE` [2]
- Handle `507 Insufficient Storage` by checking quota before transfer
- Set `X-OC-MTime` header to preserve the original photo modification time [1]

### 3.5 Mock Storage Implementations

#### In-Memory Mock

```typescript
// lib/storage/mocks/InMemoryStorageAdapter.ts

class InMemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, Map<string, { photo: Buffer; record: PhotoRecord }>> = new Map();

  async storePhoto(sessionId: string, photo: Buffer, fileName: string): Promise<PhotoRecord> { /* ... */ }
  async getPhoto(sessionId: string, photoId: string): Promise<Buffer> { /* ... */ }
  async listPhotos(sessionId: string): Promise<PhotoRecord[]> { /* ... */ }
  async deletePhoto(sessionId: string, photoId: string): Promise<void> { /* ... */ }
  async submitPhotos(sessionId: string): Promise<SubmitResult> { /* ... */ }
  async cleanup(sessionId: string): Promise<void> { /* ... */ }
}
```

**Use cases:** Unit testing, CI/CD pipelines, isolated frontend development with mocked API routes.

#### Filesystem Mock

```typescript
// lib/storage/mocks/FilesystemStorageAdapter.ts

class FilesystemStorageAdapter implements StorageAdapter {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async storePhoto(sessionId: string, photo: Buffer, fileName: string): Promise<PhotoRecord> {
    // Write to {baseDir}/{sessionId}/{photoId}.jpg
  }
  // ... other methods use fs operations
}
```

**Use cases:** Integration testing with real file I/O, debugging, development environments where photos need to persist across server restarts.

#### Seeded Mock (with folder structures as initial content)

```typescript
// lib/storage/mocks/SeededStorageAdapter.ts

class SeededStorageAdapter implements StorageAdapter {
  constructor(baseDir: string, seedData: SeedFolder[]) {
    // seedData defines the initial folder structure and files
    // e.g., [{ path: '/photos/2024-01', files: [{ name: 'IMG_001.jpg', content: Buffer.from('...') }] }]
  }
}
```

**Use cases:** Testing folder navigation, breadcrumb trail, and file listing features with realistic data.

### 3.6 Dependency Injection in Next.js

Next.js does not have a built-in DI container, but there are practical approaches:

**Option 1: Module-level injection (simplest)**

```typescript
// lib/storage/index.ts

import { NextcloudStorageAdapter } from './NextcloudStorageAdapter';
import { InMemoryStorageAdapter } from './mocks/InMemoryStorageAdapter';

const isMock = process.env.NEXT_PUBLIC_MOCK_STORAGE === 'true';

export const storageAdapter: StorageAdapter = isMock
  ? new InMemoryStorageAdapter()
  : new NextcloudStorageAdapter();
```

**Option 2: Request-scoped injection via Next.js context**

```typescript
// lib/storage/context.ts

import { createContext, useContext } from 'react';

export const StorageAdapterContext = createContext<StorageAdapter | null>(null);

// In the API route or layout:
export function useStorageAdapter(): StorageAdapter {
  const adapter = useContext(StorageAdapterContext);
  if (!adapter) throw new Error('StorageAdapter not provided');
  return adapter;
}
```

**Option 3: Factory pattern with environment-based selection**

```typescript
// lib/storage/factory.ts

export function createStorageAdapter(): StorageAdapter {
  switch (process.env.STORAGE_ADAPTER) {
    case 'mock':
      return new InMemoryStorageAdapter();
    case 'filesystem':
      return new FilesystemStorageAdapter('/tmp/photo-docs');
    case 'nextcloud':
    default:
      return new NextcloudStorageAdapter();
  }
}
```

**Recommendation:** Use **Option 3** (factory pattern) for maximum flexibility. It allows:
- Environment variable selection (`STORAGE_ADAPTER=mock` for tests, `STORAGE_ADAPTER=nextcloud` for production)
- Easy addition of new adapter implementations
- No coupling to Next.js internals
- Testability via `jest.mock()` or `vi.mock()` in Vitest

### 3.7 Testing Strategy

| Test Type | Adapter | Data | Purpose |
|-----------|---------|------|---------|
| Unit tests | `InMemoryStorageAdapter` | In-memory buffers | Test business logic without I/O |
| Integration tests | `FilesystemStorageAdapter` | Real files on disk | Test file I/O, streaming, chunking |
| Error condition tests | Custom mock | Configurable failures | Test retry logic, quota errors, network failures |
| E2E tests | `NextcloudStorageAdapter` | Real Nextcloud instance | Test the full upload pipeline |

---

## 4. Summary and Recommendation

### Upload Strategy: Hybrid (Temporary Storage + Chunked Upload)

**Recommendation:** Store photos temporarily on the Next.js backend filesystem, then transfer to Nextcloud asynchronously using the chunked upload v2 API.

**Rationale:**
1. **Connectivity resilience** is the primary requirement. Chunked upload v2 allows resuming failed transfers at the chunk level (5MB–5GB chunks), and temporary storage ensures photos survive server restarts or connection drops [2].
2. **Session size** (40–250MB) is well within the capacity of a local temp directory or tmpfs mount.
3. **Direct streaming** is simpler but makes mid-upload retry nearly impossible — if the Nextcloud connection drops during a direct PUT, the entire upload must restart from the client.
4. **The `@nextcloud/upload` npm package** provides a battle-tested client-side chunked upload implementation with retry logic, but for server-to-server transfer, we implement chunked upload directly using WebDAV API calls [2][4].
5. **Temporary storage + background transfer** decouples the client response from the Nextcloud transfer, improving perceived performance and enabling batch optimization.

### Storage Abstraction: Repository + Adapter Pattern

**Recommendation:** Define a `StorageAdapter` interface, implement `NextcloudStorageAdapter` for production and `InMemoryStorageAdapter` / `FilesystemStorageAdapter` for testing, and select the implementation via a factory function driven by environment variables.

This enables:
- Unit testing with zero external dependencies
- Isolated frontend development with mocked API routes
- Error condition testing (network failures, quota exceeded, invalid responses)
- Easy migration to a different storage backend in the future

---

## References

[1] Basic File & Folder Operations — Nextcloud 35 Developer Manual: https://docs.nextcloud.com/server/latest/developer_manual/client_apis/WebDAV/basic.html

[2] Chunked file upload — Nextcloud 35 Developer Manual: https://docs.nextcloud.com/server/latest/developer_manual/client_apis/WebDAV/chunking.html

[3] File bulk upload — Nextcloud 35 Developer Manual: https://docs.nextcloud.com/server/latest/developer_manual/client_apis/WebDAV/bulkupload.html

[4] @nextcloud/upload npm package: https://www.npmjs.com/package/@nextcloud/upload

[5] @nextcloud/upload source (GitHub): https://github.com/nextcloud-libraries/nextcloud-upload

[6] Project context (CONTEXT.md): `/Users/benjamin/dev/odoo/photo-docs/CONTEXT.md`

[7] Nextcloud filesystem API — Nextcloud 35 Developer Manual: https://docs.nextcloud.com/server/latest/developer_manual/server/architecture/files.html

[8] Next.js Route Handlers documentation: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
