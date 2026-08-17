Label: wayfinder:map

## Destination

A spec that evaluates whether a webapp can integrate device capabilities (camera access, offline storage, background upload) to achieve one interaction per photo for multi-photo capture in a Nextcloud folder structure, to hand off to stakeholders for implementation decisions.

## Notes

- **Domain:** Nextcloud photo uploader webapp — a custom frontend for taking multiple photos in one go, with offline support and Nextcloud folder navigation
- **Skills to consult:** grilling, domain-modeling, research, prototype
- **Standing preferences:** webapp first (Next.js as the fullstack JS framework), native only as fallback if webapp can't meet the hard constraint; spec for stakeholders (not implementation); one interaction per photo is the hard constraint; Nextcloud auth provider is primary; REST API for upload

## Decisions so far

- [Can browser camera APIs support one-interaction-per-photo?](issues/01-camera-api-support.md) — Canvas `drawImage` approach works across all platforms; stream stays alive between captures; camera must be re-acquired on return from background.
- [Is browser storage sufficient for 20–50 photos?](issues/02-browser-storage.md) — IndexedDB is sufficient (40–250 MB needed, quotas are tens of GB); `navigator.storage.persist()` protects against eviction.
- [Which interaction model serves the one-interaction-per-photo constraint?](issues/03-interaction-model.md) — Option A (in-camera strip): tap to capture, tap to toggle rejection in a scrollable strip, submit with toast notification. Selection is implicit, rejection is toggle (reversible until submit), cancel discards session, uploads continue in background, session belongs to a folder.
- [Should the webapp be a PWA or a standard web app?](issues/04-pwa-evaluation.md) — PWA is recommended: service worker provides background sync and offline folder navigation. iOS Safari lacks background sync but sync resumes when page returns. PWA complexity is bounded and worth the usability lever.
- [What are the target devices and breakpoints for responsive design?](issues/05-responsive-design.md) — T-shirt sizes: small (smartphone), medium (tablet). Desktop out of scope. Folder view = single folder, list navigation, breadcrumb trail. Capture screen = full-screen modal, strip adapts to orientation, submit = back to folder with toast, cancel = confirmation + back with toast. Upload status indicators required, error handling = toast + file indicator. T-shirt sizes are sufficient; exact breakpoints are implementation detail.
- [What are the known error modes for the photo upload workflow?](issues/06-error-modes.md) — 11 error modes documented: mid-transfer upload failure, partial batch failure, storage full, user cancellation, connectivity drop/return, camera stream loss, camera permission denied, Nextcloud auth failure, Nextcloud API errors, file naming conflicts, session abandonment. Spec must cover retry, visual progress, connectivity detection, storage-full handling, session resumption, and cancellation cleanup.
- [Should a prototype be built to validate the interaction model?](issues/07-prototype.md) — Skipped. The interaction model is already settled; a blank Next.js app would scaffold without validating anything. Focus on resolving the remaining fog instead.
- [Should the webapp backend stream photos directly to Nextcloud or store temporarily before transfer?](issues/08-backend-architecture.md) — Hybrid approach: temporary local buffer + async chunked upload to Nextcloud. `StorageAdapter` interface with `NextcloudStorageAdapter` and `MockStorageAdapter` implementations, factory-driven by env var. Mock storage enables unit tests, isolated frontend dev, and error condition testing without touching production Nextcloud.

## Out of scope

- Desktop devices for responsive design — T-shirt sizes only cover small (smartphone) and medium (tablet)

