# Known Error Modes for the Photo Upload Workflow

## 1. Upload Fails Mid-Transfer (Single Photo)

A network interruption occurs while a single photo is being uploaded to Nextcloud via the REST API.

- **Cause**: Mobile data drops, Wi-Fi switches, temporary server unavailability, timeout.
- **Detection**: Upload progress listener reports failure or stalls past a threshold.
- **Required response**: Retry the upload automatically. The Nextcloud REST API supports resumable uploads via chunked transfer; if the server supports it, the upload can resume from the last successful chunk rather than restarting from zero. If the server does not support resumable uploads, the full upload must restart.
- **Visual feedback**: A progress indicator per photo that shows retry status (e.g., "Retrying...", "Upload failed, retrying"). A toast notification for permanent failures.
- **Source**: Nextcloud documentation on resumable uploads; CONTEXT.md Fault Tolerance entry.

## 2. Partial Batch Failure

Some photos in a session upload successfully while others fail.

- **Cause**: Per-photo variation in file size, network conditions during staggered uploads, or Nextcloud server rejecting specific files.
- **Required response**: Per-photo upload status tracking. Successful photos are confirmed; failed photos are retried independently. The user sees which photos succeeded and which need attention.
- **Visual feedback**: Each photo in the upload queue shows a status indicator (uploading, success, failed, retrying). A summary toast after the batch completes: "X of Y photos uploaded successfully." Failed photos remain in the queue for retry.
- **Source**: CONTEXT.md Fault Tolerance entry ("visual progress feedback required").

## 3. Storage Full (Browser Quota Exceeded)

The browser's IndexedDB quota is exceeded and no more photos can be stored locally.

- **Cause**: Device has limited storage; the user has captured many photos without transferring to Nextcloud.
- **Detection**: `QuotaExceededError` on IndexedDB write, or `navigator.storage.estimate()` returning usage near quota.
- **Required response**: Block new captures with a clear UI message ("Storage full — transfer photos to Nextcloud to free space"). The CONTEXT.md states: "When storage limit is reached, new photos can't be taken until stored photos are transferred to Nextcloud."
- **Visual feedback**: Banner or modal in the capture UI indicating storage is full and prompting the user to submit.
- **Source**: CONTEXT.md Store entry; MDN Storage API / QuotaExceededError.

## 4. User Cancels During Upload

The user explicitly cancels the upload process before it completes.

- **Cause**: User navigates away, hits a cancel button, or closes the session.
- **Required response**: In-progress uploads should be aborted gracefully. Partially uploaded files on Nextcloud should be cleaned up (delete the partial upload). Locally stored photos that were not yet uploaded remain for the next session.
- **Visual feedback**: Confirmation dialog before cancel ("Cancel upload? X photos already uploaded, Y still in progress."). After cancel: toast "Upload cancelled — Z photos saved locally for next session."
- **Source**: CONTEXT.md Rejection entry (cancelling is a session-level action, not a per-photo action).

## 5. Connectivity Drops and Returns

Network goes down during upload (or during the capture session) and then returns.

- **Detection**: Browser `navigator.onLine` events, or more robustly, the Background Sync API / service worker `sync` event.
- **Required response**: Queue uploads that haven't started. When connectivity returns, automatically start uploading queued photos. The CONTEXT.md states: "Use browser APIs to detect connectivity and automatically start uploading queued photos."
- **Visual feedback**: An offline indicator when connectivity is lost. An auto-sync notification when connectivity returns and uploads resume.
- **Source**: CONTEXT.md Background Upload entry; CONTEXT.md Fault Tolerance entry.fé

## 6. Camera Stream Ends Unexpectedly

The camera `MediaStream` track ends due to app switch, screen lock, system resource pressure, or browser tab suspension.

- **Cause**: Document becomes non-visible (app switch, screen lock); browser suspends or stops the `getUserMedia` stream.
- **Detection**: `visibilitychange` event on the document; `ended` event on `MediaStreamTrack`.
- **Required response**: Re-acquire the camera stream when the page returns to the foreground. The CONTEXT.md states: "On return, the camera reopens with previously captured photos still stored locally."
- **Visual feedback**: If the camera cannot be re-acquired (user revoked permission, or hardware unavailable), show an error message and offer to retry or switch to a different capture method.
- **Source**: CONTEXT.md Camera Persistence entry; W3C Media StreamTrack life-cycle; research/01-camera-api-support.md.

## 7. Camera Permission Denied

The user denies camera access or revokes it after initially granting it.

- **Cause**: Browser permission prompt denied; user changed permission in browser settings.
- **Detection**: `getUserMedia()` throws `NotAllowedError` or `PermissionDeniedError`.
- **Required response**: Show a clear, non-technical error message ("Camera access is required to take photos — please allow camera access in your browser settings."). Offer a link to browser settings or instructions.
- **Visual feedback**: Inline error banner on the capture screen, not a console error.
- **Source**: W3C Media Capture and Streams spec; MDN getUserMedia error handling.

## 8. Nextcloud Authentication Failure

The authentication token or session with Nextcloud expires or is invalid.

- **Cause**: Token expiry, user changed Nextcloud password, app token revoked, or network-level auth challenge failure.
- **Detection**: Nextcloud API returns `401 Unauthorized` or `403 Forbidden` on upload or folder navigation requests.
- **Required response**: Trigger re-authentication flow. If Nextcloud auth is the primary method (per CONTEXT.md), redirect the user to Nextcloud OAuth or re-enter credentials. If the auth provider supports it, silently refresh the token.
- **Visual feedback**: "Session expired — please log in again." with a re-authenticate button. Upload queue is paused and resumes after re-auth.
- **Source**: CONTEXT.md Authentication entry; Nextcloud API docs.

## 9. Nextcloud API Errors

Server-side errors from the Nextcloud REST API during upload or folder navigation.

- **Cause**: `500` Internal Server Error, `429` Rate Limit Exceeded, `503` Service Unavailable, `413` Payload Too Large.
- **Required response**: Retry with exponential backoff for transient errors (`5xx`, `429`). For permanent errors (`413` — file too large), inform the user and offer to skip or compress the photo.
- **Visual feedback**: Per-photo error state with a "Retry" button. A toast for persistent failures after max retries.
- **Source**: Nextcloud REST API documentation; CONTEXT.md Fault Tolerance entry.

## 10. File Naming Conflicts

A file with the same name already exists in the target Nextcloud folder.

- **Cause**: User captures a photo with the same filename as an existing file in the folder.
- **Required response**: Detect the conflict before uploading (HEAD request to check if file exists). If conflict exists, rename the new file with a suffix (`photo (1).jpg`, `photo (2).jpg`) or use a timestamp-based naming scheme to avoid conflicts.
- **Visual feedback**: If auto-rename is used, no notification needed. If the user is shown the conflict, a subtle indicator on the photo ("Already exists — renamed to photo (1).jpg").
- **Source**: Nextcloud WebDAV/REST API conventions.

## 11. Session Abandonment (Orphaned Local Photos)

The user starts a capture session but never submits — they close the browser, lose the tab, or abandon the workflow.

- **Cause**: User gets distracted, closes the tab, or navigates away without submitting.
- **Required response**: Locally stored photos remain in IndexedDB and are available for the next session. On return, the user can see their stored photos and either submit or discard them. No automatic cleanup is needed unless storage pressure forces eviction.
- **Visual feedback**: On return, the app should detect stored photos from the abandoned session and prompt: "You have X unsaved photos from a previous session. Do you want to submit them or discard them?"
- **Source**: CONTEXT.md Session entry; CONTEXT.md Store entry; CONTEXT.md Camera Persistence entry.

## Summary of Required Spec Coverage

The spec for this effort must document these error modes and specify:
1. **Retry mechanism** — automatic retry with exponential backoff for transient failures; user-initiated retry for persistent failures.
2. **Visual progress feedback** — per-photo status indicators, upload progress bar, session-level summary.
3. **Connectivity detection** — use browser APIs (`navigator.onLine`, Background Sync API) to detect and react to connectivity changes.
4. **Storage full handling** — block new captures with a clear UI message when quota is exceeded.
5. **Session resumption** — stored photos persist across sessions; on return, show unsaved photos and let the user decide.
6. **Cleanup on cancellation** — abort in-progress uploads and clean up partial Nextcloud files.

## References

- CONTEXT.md: Fault Tolerance, Background Upload, Camera Persistence, Store, Session, Rejection entries
- research/01-camera-api-support.md: Stream persistence and re-acquisition details
- research/02-browser-storage.md: QuotaExceededError handling, eviction policies
- Nextcloud REST API documentation: Resumable uploads, authentication, error codes
