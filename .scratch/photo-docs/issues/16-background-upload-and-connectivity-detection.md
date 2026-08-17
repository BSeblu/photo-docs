# 16 — Background upload and connectivity detection

**What to build:** Connectivity detection that monitors network state, pauses in-flight uploads gracefully when offline, queues newly submitted photos, and automatically resumes transfers when connection is restored.

**Blocked by:** 15 — Upload service and batch submission

**Status:** ready-for-agent

- [ ] App monitors browser online/offline status (`navigator.onLine` and event listeners)
- [ ] Visual indicator informs user when device is offline while preserving local queue
- [ ] Queued uploads automatically start/resume upon network reconnection
- [ ] In-flight chunked uploads recover gracefully without restarting from scratch if supported
