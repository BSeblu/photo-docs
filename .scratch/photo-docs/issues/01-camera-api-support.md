Label: wayfinder:research
Assignee: benjamin
Status: closed

## Question

Can browser camera APIs (MediaDevices API, getUserMedia, <video> element) support the one-interaction-per-photo capture model? Specifically: can a webapp open the camera, capture a photo with a single tap, and keep the camera open for the next photo — all without leaving the browser context? What are the platform-specific limitations (iOS Safari, Android Chrome, tablets)?

## Research findings

See [research/01-camera-api-support.md](../../research/01-camera-api-support.md) for the full research document. Key finding: canvas `drawImage` approach works across all platforms; `getUserMedia` stream stays alive between captures; iOS Safari lacks `captureStream()` and `ImageCapture`; camera access is suspended on backgrounding and must be re-acquired on `visibilitychange`.

## Resolution

**Canvas `drawImage` approach works across all platforms.** `getUserMedia()` stream stays alive between captures — no need to re-acquire the camera per photo. The one-interaction-per-photo model is technically feasible: call `getUserMedia()` once, attach to `<video>`, and on each tap, draw the current frame to a canvas and export via `canvas.toDataURL()`. iOS Safari lacks `captureStream()` and `ImageCapture` but supports the canvas approach. Camera access is suspended on app switch/screen lock and must be re-acquired on `visibilitychange`.

## Comments