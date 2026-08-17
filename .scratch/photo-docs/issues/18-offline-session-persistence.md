# 18 — Offline session persistence with IndexedDB

**What to build:** Durable local session storage using IndexedDB and `navigator.storage.persist()` so photos and active session state survive app switching, browser refresh, or tab closure. On app re-open, restores any incomplete or pending session.

**Blocked by:** 13 — Camera capture pipeline, 16 — Background upload and connectivity detection

**Status:** ready-for-agent

- [ ] Captured photo blobs and metadata are persisted to IndexedDB
- [ ] `navigator.storage.persist()` is requested to prevent browser eviction
- [ ] Reloading or returning to the app detects existing session photos and restores viewfinder/strip state
- [ ] User is prompted on re-open if unsubmitted photos from a previous session are detected
