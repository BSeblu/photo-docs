Label: wayfinder:grilling
Assignee: benjamin
Status: closed

## Question

Which interaction model better serves the one-interaction-per-photo constraint? Option A: tap-to-capture with a separate submit button. Option B: camera stays open, tap-to-submit per photo, cancel to close, with ability to remove photos before final submit. Evaluate both for technical feasibility and usability — which is more intuitive, which has fewer failure modes, and which better supports the offline workflow?

## Resolution

**Option A (in-camera strip) is the favored interaction model.** The camera stays open during a session, showing a scrollable strip of all photos taken. Every captured photo is selected by default; tapping a photo toggles its rejection (reversible at any point before submit). A separate cancel button discards the entire session (with confirmation). A separate submit button triggers upload — a toast confirms "x photos will be uploaded" — and the folder view shows new photos with upload status indicators (idle, processing, success, error). The capture button is disabled when storage is full.

Key design decisions:
- **Selection is implicit:** all captured photos are in the upload set by default; tap to toggle rejection
- **Rejection is toggle, not delete:** reversible until submit; rejected photos discarded after submit
- **Cancel discards the session:** with confirmation dialog
- **Submit triggers upload:** toast notification, not a progress bar; progress is shown in the folder view
- **Uploads continue in background:** in-progress uploads go to the original folder; a new session is independent
- **Session belongs to a folder:** all photos are associated with the folder they were captured in
- **Strip is scrollable and always visible:** functional requirement; layout details are implementation-specific

Blocked by: 01-camera-api-support, 02-browser-storage