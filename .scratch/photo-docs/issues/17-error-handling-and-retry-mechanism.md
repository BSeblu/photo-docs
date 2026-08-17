# 17 — Error handling and retry mechanism

**What to build:** Comprehensive error handling for all 11 documented error modes (network timeouts, storage quota limits, 4xx/5xx responses, auth expiration). Implements exponential backoff auto-retry for transient errors and manual per-photo "Retry" buttons for persistent errors.

**Blocked by:** 15 — Upload service and batch submission, 16 — Background upload and connectivity detection

**Status:** ready-for-agent

- [ ] Transient upload errors automatically retry with exponential backoff
- [ ] Persistent failures display a per-photo error badge and a manual "Retry" action
- [ ] `QuotaExceededError` is trapped during capture, blocking new shots with a clear storage-full modal/toast
- [ ] User-initiated cancellation aborts in-flight network requests cleanly
