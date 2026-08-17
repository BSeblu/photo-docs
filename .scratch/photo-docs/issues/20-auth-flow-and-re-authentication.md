# 20 — Auth flow and re-authentication

**What to build:** Authentication management for Nextcloud accounts. Detects session/token expiry (401/403), displays a re-auth modal without dropping queued local photos, and resumes pending transfers once re-authenticated.

**Blocked by:** 15 — Upload service and batch submission

**Status:** ready-for-agent

- [ ] Nextcloud login / OAuth credential connection flow
- [ ] API 401/403 responses pause queue and trigger re-authentication dialog
- [ ] Locally stored photos and active queue remain intact during re-auth
- [ ] Queued uploads automatically resume upon successful login
