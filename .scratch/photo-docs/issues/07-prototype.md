Label: wayfinder:prototype
Status: closed

## Question

Should a small prototype be built to validate the interaction model and gather feedback from real users before building the full implementation? The prototype would be a working webapp served via ngrok, testable on a phone. Evaluate: is the interaction model clear enough to prototype, or do the research and grilling tickets need to resolve first?

No blockers.

## Resolution

Skipped. The interaction model is already settled through research and grilling (Option A: in-camera strip with rejection toggle, swipe-to-reject). A prototype in a blank Next.js app with no real interaction logic would scaffold without validating anything. The real unknowns are in the fog (backend architecture, Nextcloud API endpoints) — focus on resolving those and producing the spec instead.