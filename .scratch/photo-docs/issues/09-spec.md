Label: ready-for-agent
Assignee: benjamin
Status: open

## Destination

A spec that evaluates whether a webapp can integrate device capabilities (camera access, offline storage, background upload) to achieve one interaction per photo for multi-photo capture in a Nextcloud folder structure, to hand off to stakeholders for implementation decisions.

## Solution

A fullstack JavaScript webapp (Next.js) that provides a camera-first interface for photographers to capture photos one interaction at a time, select which photos to upload by toggling rejection in an in-camera strip, and transfer marked photos to their Nextcloud storage. The app works offline by storing captures locally in IndexedDB and uploading them in the background when connectivity returns, with a StorageAdapter abstraction that swappably supports a mock storage backend for testing and development alongside the production Nextcloud adapter.

## User Stories

1. As a photographer, I want to open the app and immediately see the camera viewfinder so that I can start taking photos without any setup or configuration step.
1. As a photographer, I want to tap the camera button once to capture a single photo so that the interaction is simple, fast, and requires no extra steps per photo.
1. As a photographer, I want the camera stream to remain open between captures so that I can take multiple photos in rapid succession without re-granting camera permission.
1. As a photographer, I want captured photos to appear in a scrollable strip below the camera viewfinder so that I can see everything I have captured in the current session.
1. As a photographer, I want to see all captured photos in the strip by default (implicitly selected) so that I do not need to manually select every photo I want to upload.
1. As a photographer, I want to tap a photo in the strip to toggle its rejection so that I can remove unwanted photos from the upload set with a single tap.
1. As a photographer, I want rejected photos to be visually distinguished (e.g., a red border or checkmark overlay) so that I can see at a glance which photos are selected and which are rejected.
1. As a photographer, I want to toggle a rejected photo back into the selected set so that rejection is reversible at any point before I submit.
1. As a photographer, I want to see a submit button that triggers transfer of all selected photos to Nextcloud so that I can finalize and upload my selection.
1. As a photographer, I want to see a toast or notification indicating that upload has started so that I know the transfer is underway.
1. As a photographer, I want the app to detect when I lose connectivity and automatically queue uploads so that no photo is lost due to a network interruption.
1. As a photographer, I want the app to automatically resume uploading queued photos when connectivity returns so that I do not have to manually restart the transfer.
1. As a photographer, I want each photo to show an upload progress indicator so that I can track how much of my batch has been transferred.
1. As a photographer, I want the app to retry an upload that fails mid-transfer with exponential backoff so that transient network errors do not permanently block my photos.
1. As a photographer, I want failed uploads to show a clear error state with a "Retry" button so that I can manually re-attempt uploads that did not recover automatically.
1. As a photographer, I want successful uploads to show a confirmed state so that I know which photos have been safely transferred to Nextcloud.
1. As a photographer, I want a batch summary toast after all uploads complete (e.g., "X of Y photos uploaded successfully") so that I get a clear session-level status.
1. As a photographer, I want a persistent error indicator (e.g., a toast or file-level status) for photos that fail after all retry attempts so that I am aware of permanent failures.
1. As a photographer whose storage is full, I want the app to block new captures and display a clear message ("Storage full — transfer photos to Nextcloud to free space") so that I understand why I cannot take more photos.
1. As a photographer who accidentally navigates away during capture, I want my captured photos to persist in local storage so that I can return to the app and continue my session.
1. As a photographer who switches to another app or locks my screen, I want the app to pause the camera and reopen it with captured photos still available so that I can resume capture without losing my work.
1. As a photographer who brings the app back after it was suspended, I want the camera to re-acquire the stream automatically so that I can continue taking photos without re-creating the session.
1. As a photographer who denies camera permission, I want a clear inline error message with guidance ("Camera access is required — please allow it in your browser settings") so that I know why the camera is not working and how to fix it.
1. As a photographer who captures a photo when the browser storage quota is exceeded, I want the app to gracefully handle the `QuotaExceededError` by blocking further captures and showing a storage-full message so that I do not lose any data.
1. As a photographer who navigates to a different Nextcloud folder, I want to see a breadcrumb trail showing the current path so that I can understand where I am and navigate back to parent folders.
1. As a photographer, I want each breadcrumb segment in the trail to be clickable so that I can jump to any parent folder without scrolling back through the hierarchy.
1. As a photographer using a small smartphone screen, I want the interface to be usable and responsive so that I can take photos and manage selections on a limited screen.
1. As a photographer using a tablet, I want the interface to adapt to the larger screen so that the camera viewfinder and photo strip are well-proportioned.
1. As a photographer, I want the app to use responsive T-shirt sizing (small for smartphone, medium for tablet) so that the layout is optimized for the most common device sizes.
1. As a photographer using a PWA, I want the app to be installable on my device's home screen so I can launch it like a native app.
1. As a photographer using a PWA, I want the service worker to enable offline folder navigation so that I can browse my Nextcloud folder structure even without connectivity.
1. As a photographer using a PWA, I want background sync so that uploads continue or resume when the app returns to the foreground after being suspended.
1. As a photographer, I want the app to attempt re-authentication with Nextcloud if my session token expires so that I am not permanently locked out of my storage.
1. As a photographer, I want a re-authentication prompt with clear instructions when auth fails so that I can log in again without losing my queued photos.
1. As a photographer, I want my queued photos to remain in the upload queue after re-authentication succeeds so that I do not need to re-select them.
1. As a photographer, I want to avoid naming conflicts when a file with the same name already exists in the target Nextcloud folder so that I do not accidentally overwrite an existing file.
1. As a photographer, I want the app to auto-rename conflicting files (e.g., appending a suffix like `photo (1).jpg`) when a conflict is detected so that both the existing and new file are preserved.
1. As a developer, I want the `StorageAdapter` interface to abstract the actual storage implementation so that I can swap mock storage for testing and development without changing domain logic.
1. As a developer, I want a `MockStorageAdapter` implementation that returns seeded folder structures as initial content so that my test environment mirrors a real Nextcloud folder hierarchy.
1. As a developer working on the frontend, I want to use the mock storage adapter so that I can test capture, selection, and rejection flows without a running Nextcloud instance.
1. As a developer writing unit tests, I want the mock storage adapter to support error injection (quota exceeded, network failure, auth token expiry) so that I can test how the app handles each error condition.
1. As a developer, I want the `StorageAdapter` factory to be driven by an environment variable (`STORAGE_ADAPTER=nextcloud|mock`) so that switching between production and test implementations requires zero code changes.
1. As a developer, I want the `NextcloudStorageAdapter` to implement the upload via chunked transfer with retry so that production uploads are resilient to connectivity drops.
1. As a developer, I want each photo file to retain its original JPEG format and EXIF metadata (timestamp, orientation, GPS if available) so that I do not lose any image data during capture, storage, or transfer.
1. As a developer, I want photo files to be named using their capture timestamp so that each file has a unique, sortable, and predictable name.
1. As a developer working on backend infrastructure, I want the Next.js API routes to handle the upload logic so that the backend and frontend can be developed and deployed independently.
1. As a developer, I want the upload code to use the Nextcloud REST API (not WebDAV) because WebDAV was experienced as slow and the REST API has potential to be faster.
1. As a developer, I want the app to evaluate Nextcloud's documented best practices for upload APIs before defaulting to a specific upload strategy.
1. As a stakeholder, I want the spec to describe the expected behavior of each user-facing feature in enough detail that implementation can proceed without ambiguity.
1. As a stakeholder, I want the spec to record which architectural decisions were made and why so that implementation can follow the agreed-upon structure.
1. As a stakeholder, I want the spec to identify what is in scope and out of scope so that the implementation team does not build features outside the effort's boundary.
1. As a stakeholder, I want the spec to cover known error modes and how the app should respond to each so that the implementation team builds appropriate error handling.
1. As a stakeholder, I want the spec to note that the app treats Nextcloud as the primary authentication provider, reusing existing Nextcloud accounts, with a separate auth provider as a fallback.
1. As a stakeholder, I want to be able to cancel a submission at any time before it is sent to Nextcloud so that I can discard my selection without committing.
1. As a photographer, I want cancelled sessions to discard rejected photos and leave selected photos stored locally so that I can start a new session with my existing selection intact.
1. As a photographer, I want the app to show a confirmation prompt when I attempt to cancel a session so that I do not accidentally lose my work.
1. As a photographer, I want rejected photos in the strip to produce a visual and haptic feedback on tap so that the rejection action feels immediate and intentional.
1. As a photographer, I want the camera capture button to be large and easy to tap on a smartphone so that the one-interaction-per-photo constraint is reliable.
1. As a photographer, I want the app to not register accidental background touches as capture or rejection actions so that unintentional taps do not alter my session.
1. As a photographer, I want the session to belong to a Nextcloud folder so that all captured photos are associated with a specific remote destination.
1. As a photographer, I want the app to create or use an existing folder in Nextcloud for the current session so that uploaded photos are organized in a meaningful way.
1. As a photographer, I want the app to check available storage space locally before starting a batch upload so that it can warn me if the device does not have enough space for the transfer.
1. As a photographer using a connection that returns after being interrupted, I want the app to detect the connectivity change and auto-start uploading queued photos without manual intervention.
1. As a photographer, I want the app to handle per-photo upload failures within a batch (some succeed, some fail) so that I do not lose all my photos because one upload failed.
1. As a photographer, I want to be able to retry individual failed photos while the rest of the batch continues uploading so that I am not blocked by a single failure.
1. As a photographer from an iOS device, I want the app to use the canvas `drawImage` approach for photo capture because it is the only cross-platform approach that works consistently on iOS Safari.
1. As a photographer from an Android device, I want the app to use whichever capture approach works on their platform (canvas `drawImage` is the common baseline) so that they get a reliable capture experience.
1. As a photographer using a tablet, I want the capture and selection interface to adapt to the landscape and portrait orientations so that I can take photos comfortably in either orientation.
1. As a photographer, I want the photo strip to adapt its layout based on device orientation (landscape versus portrait) so that I can see as many photos as possible.
1. As a photographer who has uploaded photos, I want to be able to submit additional photos from the same session and see the total upload progress so that I can incrementally build and transfer a batch.
1. As a photographer, I want the app to allocate storage for photos in Mobile Chrome, Safari, and Firefox as described so that the storage approach is scoped correctly before implementation begins.
1. As a stakeholder, I want the spec to explicitly note that desktop devices are out of scope of this effort so that the implementation team does not optimize for desktop breakpoints.
1. As a stakeholder, I want the spec to note that PWA features like service workers and background sync are recommended but not required for the minimum viable implementation.
1. As a developer, I want to be able to check available browser storage space with `navigator.storage.estimate()` so that I can proactively warn users before they run out of quota.
1. As a developer, I want the app to request persistent storage via `navigator.storage.persist()` so that critical photos are protected from LRU eviction under storage pressure.
1. As a developer, I want all `IndexedDB` write operations to be wrapped in `try...catch` blocks to handle `QuotaExceededError` gracefully so that the app does not crash when storage is full.
1. As a developer, I want the `StorageAdapter` interface to define a clear contract for `save`, `list`, `get`, `delete`, `folderExists`, `createFolder`, and `deleteFolder` operations so that both implementations adhere to the same API.
1. As a developer, I want the mock storage adapter to persist its state in memory (with optional filesystem fallback) so that tests are isolated and do not interfere with each other.
1. As a developer, I want the image format decision to specify JPEG with EXIF retained as the target format for all captured, stored, and transferred photos.
1. As a developer, I want the file naming strategy to use the capture timestamp (ISO 8601) as the filename so that files are unique, sortable, and human-readable.
1. As a developer, I want the spec to define the scope of "one interaction per photo" clearly so that the implementation team understands what counts as an interaction (a single tap on the capture button, not navigation or accidental touches) and what does not.
1. As a developer, I want the spec to define "selection" (the set of photos chosen for upload), "rejection" (toggling a photo out of the upload set), and "session" (from first capture to submit or cancel) using the vocabulary from the project glossary.
1. As a developer, I want the spec to record known constraints explicitly so that they are visible to the implementation team and not discovered as surprises during development.
1. As a stakeholder, I want to see the spec mention that a small prototype was considered but skipped because the interaction model was already settled through prior research and grilling, and that the next step is to resolve the remaining fog around backend architecture and API endpoints.
1. As a stakeholder, I want the spec to acknowledge that the alternate approach (native app via React Native or Electron) is a fallback only if the webapp cannot meet the device capability requirements, but that it is out of scope for the current effort.
1. As a developer, I want the spec to record that the REST API is preferred over WebDAV for upload because WebDAV was experienced as slow (MacBook connection), and that the spec should evaluate based on Nextcloud's documented best practices.
1. As a developer, I want the spec to note that the wayfinder approach produced the architectural decisions documented in the PRD and that those decisions are the foundation for this spec.

## Implementation Decisions

- **Photo capture**: `getUserMedia()` opens the camera once; capture uses canvas `drawImage` or a lightweight wrapper component (e.g. `react-camera-component`) to grab the current video frame and export it as a JPEG. Camera must be re-acquired on return from background via `visibilitychange` listener.
- **Interaction model**: Option A — in-camera strip. Photos appear in a scrollable strip below the viewfinder. All captured photos are implicitly selected. Tapping a photo in the strip toggles its rejection. Selection is implicit (all photos selected by default), rejection is toggle (reversible until submit). Cancel discards the session. Submit triggers transfer to Nextcloud.
- **Architecture**: Next.js fullstack. API routes handle backend logic (upload, folder navigation). Frontend handles capture, selection, and UI using ShadCN UI components and Tailwind CSS.
- **Storage**: IndexedDB for local photo caching between capture and submit. `navigator.storage.persist()` is requested to protect against LRU eviction. All writes wrapped in `try...catch` for `QuotaExceededError`.
- **Upload approach**: Hybrid — photos are stored temporarily locally, then uploaded asynchronously to Nextcloud via chunked transfer. Async upload decouples capture from transfer and enables background upload and mid-upload retry.
- **Upload protocol**: Nextcloud REST API (not WebDAV). Chunked upload v2 for resumable transfers using Nextcloud client libraries (e.g. `@nextcloud/upload` / `@nextcloud/client-web`).
- **StorageAdapter seam**: `StorageAdapter` interface defines the contract for storage operations (`save`, `list`, `get`, `delete`, `folderExists`, `createFolder`). Two implementations: `NextcloudStorageAdapter` (production, backed by Nextcloud client library) and `MockStorageAdapter` (testing/development). Factory driven by `STORAGE_ADAPTER` environment variable (`nextcloud|mock`).
- **Authentication**: Primary — Nextcloud as the authentication provider, reusing existing Nextcloud accounts. Fallback — a separate auth provider with an API token for a single integration user. The spec evaluates Nextcloud auth first.
- **Responsive design**: T-shirt sizes only — small (smartphone, e.g. 375px and up), medium (tablet, e.g. 768px and up). Desktop is out of scope. The spec uses responsive breakpoints as implementation detail.
- **PWA**: Recommended (service worker for offline capability and installability). iOS Safari lacks background sync but sync resumes when the page returns.
- **Image format and file naming**: Capture timestamp (ISO 8601) used as filename. JPEG with EXIF metadata retained for all photos.
- **Error handling**: 11 known error modes documented (mid-transfer failure, partial batch failure, storage full, user cancellation, connectivity drop/return, camera stream loss, camera permission denied, Nextcloud auth failure, Nextcloud API errors, file naming conflicts, session abandonment). Each has specified retry mechanism and visual feedback.
- **Parallel development**: The StorageAdapter abstraction enables frontend and backend teams to develop in parallel. Frontend uses mock storage for isolated development; backend implements the `NextcloudStorageAdapter` against the Nextcloud API. Unit tests run against mock storage without touching production Nextcloud.
- **Scope**: The spec is for stakeholders — it describes behavior and architectural decisions, not implementation details. Next.js is specified as the framework family, not as a prescriptive library choice.

## Testing Decisions

- **Seam tested**: The `StorageAdapter` interface is the highest and only seam required for testing. All storage-adjacent logic (upload pipeline, error handling, session persistence) goes through this seam.
- **Mock for unit tests**: `MockStorageAdapter` provides in-memory or filesystem-backed storage with seeded folder structures and error injection. Unit tests against the mock verify domain logic without a running Nextcloud instance.
- **Error injection**: The mock supports injecting `QuotaExceededError`, network failure, auth token expiry, and `5xx` server responses. Tests verify that the app handles each error mode correctly (retry, user notification, graceful degradation).
- **External behavior only**: Tests verify the app's observable behavior (upload status indicators, retry counts, error messages, folder navigation) — not internal implementation details (IndexedDB keys, retry intervals).
- **Integration testing**: The `NextcloudStorageAdapter` is integration-tested against a staging Nextcloud instance to verify chunked upload, retry, and folder operations work end-to-end.
- **Error condition coverage**: Each of the 11 documented error modes has at least one test case that exercises the app's response to that condition.

## Out of scope

- Desktop devices for responsive design (T-shirt sizes cover small/smartphone and medium/tablet only)
- Native apps (React Native, Electron) — webapp is the primary approach; native is fallback only
- WebDAV upload protocol — REST API preferred
- Implementation of specific Next.js libraries (e.g., which CSS framework, which state management)
- Prototyping the interaction model (skipped because it was already settled)

## Further Notes

- The spec is a stakeholder-facing document that describes behavior and architecture. It does not prescribe specific libraries or code-level implementation details.
- The wayfinder process (using the wayfinder, grilling, and research skills) produced the architectural decisions documented here. The wayfinder map is at `.scratch/photo-docs/PRD.md`.
- The `StorageAdapter` seam is the key enabler for parallel frontend/backend development and testability. It was decided in ticket 08-backend-architecture as a hybrid approach: temporary local buffer + async chunked upload to Nextcloud, with `NextcloudStorageAdapter` and `MockStorageAdapter` implementations behind the interface.
- Nextcloud is the primary auth provider. Re-auth triggers a redirect to Nextcloud OAuth. Upload queue is paused during auth failures and resumes after re-auth.
- A small prototype was considered but skipped (ticket 07-prototype) because the interaction model was already settled through research and grilling, and a blank Next.js scaffold would not validate anything.

