Label: wayfinder:grilling
Assignee: benjamin
Status: closed

Should the webapp be a PWA (Progressive Web App with service worker, manifest, and installability) or a standard web app? Evaluate: does a PWA provide meaningful advantages for the offline photo capture and background upload use case? What are the trade-offs (complexity, platform support, App Store/Play Store distribution)?

## Resolution

**PWA is the recommended approach.** The service worker provides autonomous background sync — photos upload when connectivity returns, even after the page is closed. The service worker also caches folder structure and navigation state, enabling offline folder navigation. IndexedDB remains the storage layer for captured photos; the service worker manages sync and caching on top.

Key trade-offs:
- **Background sync:** works on Android and desktop; iOS Safari does not support service worker background sync, but sync resumes when the page returns to the foreground
- **Installability:** nice-to-have benefit (home screen presence), not a deciding factor
- **Complexity:** bounded (~50–100 lines for service worker + manifest plus sync logic)
- **Platform support:** PWA is the recommended approach for all platforms; iOS users get the same offline capture and storage but must manually trigger upload when returning to the page (background sync unavailable)

The PWA approach is a significant lever for meeting usability requirements — offline capture, background upload, and folder navigation all work without connectivity.

Blocked by: 02-browser-storage