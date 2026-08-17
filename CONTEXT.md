# Domain Glossary

## Interaction
A single tap on a capture button within a photo app/widget. Recognizable UX pattern. One interaction = one photo captured. Does not include navigation taps or accidental touches.

## Selection
The set of photos chosen for upload. Implicit in Option A: all captured photos are selected by default; tapping a photo in the strip toggles its rejection.

## Rejection
Toggling a photo out of the upload set. Reversible at any point before submit; rejected photos are discarded after submit. Distinct from deletion — rejection is a selection action, not a destructive one.

## Session
A single period of capture, from first photo to submit or cancel. A session belongs to a folder; all photos captured in it are associated with that folder.

## Submit
Finalizing the user's photo selection and triggering transfer to the Nextcloud backend (immediately or when connectivity returns). Does not mean local-only finalization.

## Store
Local storage of captured photos between capture and submit. Platform-dependent: IndexedDB in a browser, filesystem on native. Expected session size: 20 photos, shouldn't break with 50, won't test with more. When storage limit is reached, new photos can't be taken until stored photos are transferred to Nextcloud.

## Nextcloud Backend
Remote file storage accessed via REST API. The folder structure is a remote data model, not a local filesystem concept.

## Upload Mechanism
REST API preferred over WebDAV — WebDAV was experienced as slow (MacBook connection). The spec should evaluate based on Nextcloud's documented best practices. REST API has potential to be faster.

## Authentication
Primary: Nextcloud as the authentication provider, reusing existing Nextcloud accounts. Fallback: a separate auth provider with an API token for a single integration user (less familiar, evaluate if Nextcloud auth doesn't work out). The spec should evaluate Nextcloud auth first and mention the fallback option.

## Folder Navigation
Breadcrumb trail showing the current path in Nextcloud's folder structure, with clickable segments to navigate. Must be responsive, especially on smartphones.

## Background Upload
Use browser APIs to detect connectivity and automatically start uploading queued photos. PWA is a reference point (service workers, offline capability) but not the focus. Switching apps during upload is not a top priority.

## Camera Persistence
When the user switches apps or locks the screen, the workflow pauses. On return, the camera reopens with previously captured photos still stored locally.

## PWA
Progressive Web App — a web app using service workers for offline capability and installability. Not the focus of the spec, but if PWA is the accepted go-to approach for this use case, the spec should discuss it. The spec is about web technology generally, not PWA specifically.

## Prototype
A small prototype should be built to validate the interaction model and gather feedback from real users before building the full thing. Served via ngrok for phone testing. Part of the spec deliverable.

## Fault Tolerance
If connection is lost during photo transfer, a retry mechanism and visual progress feedback are required. The spec must address what happens when uploads fail mid-transfer. Known error modes should be documented.

## Platform/Architecture
Fullstack JS webapp. Next.js is a popular choice for this (handles both frontend and backend deployment as one app), but the spec should treat it as "a fullstack JS webapp framework" — not a specific technology decision. The spec evaluates whether a webapp can meet the device capability requirements, not which framework to use. Native (React Native, Electron) is a fallback only if the webapp can't do the job.

## Responsive Design
Start with the smallest meaningful screen size and adapt layouts as screen real estate increases. No fixed breakpoints defined yet.