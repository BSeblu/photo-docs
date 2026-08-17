# 14 — In-camera photo strip and rejection toggle

**What to build:** A scrollable photo strip overlay beneath the camera viewfinder that immediately shows all captured photos in the active session. Photos are selected by default; tapping a thumbnail toggles rejection (marked visually and reversibly). A submit button triggers the batch upload, and a cancel button discards the session with confirmation.

**Blocked by:** 13 — Camera capture pipeline

**Status:** ready-for-agent

- [ ] Captured photos appear immediately in a horizontal scrollable strip below the viewfinder
- [ ] All photos are selected by default for upload
- [ ] Tapping any photo toggles its rejected state (visual indicator overlay)
- [ ] Tapping a rejected photo un-rejects it back into the upload set
- [ ] Submit button is enabled when at least one photo is selected
- [ ] Cancel button prompts for confirmation before discarding rejected and unsaved photos
