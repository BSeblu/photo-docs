# 13 — Camera capture pipeline

**What to build:** A camera viewfinder interface built on Next.js / ShadCN (using canvas capture or a lightweight wrapper such as `react-camera-component`) that opens the device camera on load and captures full-resolution JPEG photos on a single tap without closing or interrupting the live stream. Automatically re-acquires the camera stream when returning from background/screen lock.

**Blocked by:** 10 — Next.js project scaffolding with ShadCN and test runner, 11 — StorageAdapter interface and MockStorageAdapter

**Status:** ready-for-agent

- [ ] Viewfinder displays live camera feed with a prominent, responsive capture button
- [ ] Single tap captures full-resolution photo frame as JPEG with EXIF metadata preserved
- [ ] Camera stream remains active and uninterrupted across repeated captures
- [ ] Captures are saved immediately to local storage via the storage interface
- [ ] Camera stream automatically re-attaches upon returning from background (`visibilitychange`)
- [ ] Clear user-friendly error message is displayed when camera permission is denied
