Label: wayfinder:research
Assignee: benjamin
Status: closed

## Question

Is browser storage (IndexedDB, Cache API) sufficient for storing 20–50 photos locally between capture and upload? What are the size limits per origin? Can the stored photos be retrieved reliably for upload when connectivity returns? What happens when storage quotas are exceeded?

## Research findings

See [research/02-browser-storage.md](../../research/02-browser-storage.md) for the full research document. Key finding: 40–250 MB needed for 20–50 photos — well within browser quotas; IndexedDB has no fixed per-origin limit; `navigator.storage.persist()` protects data from eviction; both APIs provide reliable offline retrieval.

## Resolution

**Browser storage is sufficient.** 20–50 photos require 40–250 MB, well within per-origin quotas (tens to hundreds of GB on modern devices). IndexedDB is the recommended storage API — it supports Blob storage, has no per-object size limit, and provides reliable retrieval. `navigator.storage.persist()` protects against LRU eviction. Both APIs provide reliable offline retrieval when connectivity returns.

## Comments