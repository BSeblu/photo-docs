Label: wayfinder:task
Assignee: benjamin
Status: closed

## Question

What are the known error modes for the photo upload workflow? Document: what happens when a photo upload fails mid-transfer, when storage is full, when the user cancels during upload, when connectivity drops and returns. What retry mechanisms and visual feedback are needed? This is a scoping ticket — the spec should note these error modes, not implement them.

No blockers.

## Resolution

Documented 11 known error modes for the photo upload workflow:

1. **Upload fails mid-transfer (single photo)** — retry with resumable/chunked upload where Nextcloud supports it; per-photo progress indicator.
2. **Partial batch failure** — per-photo status tracking; successful photos confirmed independently; failed photos retried separately.
3. **Storage full (browser quota exceeded)** — block new captures with UI message; `QuotaExceededError` on IndexedDB write detected via `try...catch` and `navigator.storage.estimate()`.
4. **User cancels during upload** — abort in-progress uploads, clean up partial Nextcloud files, leave locally stored photos for next session.
5. **Connectivity drops and returns** — queue uploads; auto-resume via browser `online` events / Background Sync API.
6. **Camera stream ends unexpectedly** — re-acquire stream on `visibilitychange` / `visibilitystate` return; handle `MediaStreamTrack.ended`.
7. **Camera permission denied** — `NotAllowedError` from `getUserMedia()`; show clear inline message with browser settings guidance.saida
8. **Nextcloud auth failure** — `401`/`403` from API; trigger re-authentication flow with Nextcloud OAuth or credentials re-entry.
9. **Nextcloud API errors** — retry with exponential backoff for transient `5xx`/`429`; per-photo retry button for persistent failures.
10. **File naming conflicts** — HEAD request to check existing files; auto-rename with suffix or timestamp-based naming.
11. **Session abandonment** — stored photos persist in IndexedDB; on return, prompt user to submit or discard unsaved photos.

The spec must cover: retry mechanism, visual progress feedback (per-photo + session-level), connectivity detection, storage full handling, session resumption, and cleanup on cancellation.

Full research: [research/06-error-modes.md](../../research/06-error-modes.md)