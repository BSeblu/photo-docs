# Browser Storage for Local Photo Caching: Research Findings

## 1. Can IndexedDB and Cache API Store 20–50 Photos (2–5 MB Each)?

### Storage Needed

| Scenario | Min | Max |
|----------|-----|-----|
| 20 photos × 2 MB | 40 MB | — |
| 20 photos × 5 MB | — | 100 MB |
| 50 photos × 2 MB | 100 MB | — |
| 50 photos × 5 MB | — | 250 MB |

**Range: 40 MB – 250 MB** depending on photo count and size.

### IndexedDB Suitability

IndexedDB is designed for storing large amounts of structured data, including files and blobs. The W3C IndexedDB 3.0 specification explicitly supports storing `Blob`, `File`, and `ArrayBuffer` objects as values in object stores [1]. MDN confirms that IndexedDB can store "significant amounts of structured data, including files/blobs" [2]. There is no per-object size limit in the specification; the only constraint is the origin's total storage quota.

### Cache API Suitability

The Cache API provides a persistent storage mechanism for `Request`/`Response` object pairs [3]. It is designed for caching HTTP responses but can store arbitrary binary data via `Response` objects constructed from `Blob` or `ArrayBuffer` bodies. MDN notes that "each browser has a hard limit on the amount of cache storage that a given origin can use" [3]. The Cache API shares the same storage bucket as IndexedDB — they are not allocated separate quotas [4].

**Verdict:** Both IndexedDB and Cache API are technically sufficient for storing 20–50 photos locally. The practical constraint is the browser's per-origin storage quota, not the API itself.

---

## 2. Storage Limits Per Origin Across Browsers

There is **no fixed per-origin byte limit** defined by any specification. Instead, each browser dynamically calculates a quota based on the device's total disk size [4].

### Firefox

- **Best-effort mode:** Up to 10% of total disk size, capped at a 10 GiB group limit for all origins on the same site [4].
- **Persistent mode:** Up to 50% of total disk size, capped at 8 TiB, not subject to the group limit [4].
- Example: On a 500 GiB drive, best-effort quota = 10 GiB; persistent quota = 250 GiB [4].

### Chrome and Chromium-based Browsers (Edge, etc.)

- **Both persistent and best-effort:** Up to 60% of total disk size [4].
- Example: On a 1 TiB drive, quota = 600 GiB [4].
- Chrome's internal policy caps browser-wide storage at 80% of total disk size; when all origins combined exceed this, eviction begins [4].

### Safari (WebKit)

- **Browser apps (Safari, etc.):** Starting with macOS 14 / iOS 17, each origin can store up to ~60% of total disk [4][5].
- **Non-browser apps (embedded WebView):** Each origin can store up to ~15% of total disk [4][5].
- **Overall quota:** Browser apps: 80% of total disk; non-browser apps: 20% of total disk [5].
- Cross-origin frames get a separate quota of roughly 1/10 of their parent frame's quota [5].
- On older Safari versions, an origin was given an initial 1 GiB quota, after which the user was prompted to grant more space [4].

### Summary Table

| Browser | Best-Effort Limit | Persistent Limit |
|---------|-------------------|------------------|
| Firefox | min(10% disk, 10 GiB group) | 50% disk, cap 8 TiB |
| Chrome/Edge | 60% disk | 60% disk |
| Safari (browser app) | 60% disk | 60% disk |
| Safari (embedded WebView) | 15% disk | 15% disk |

**For a typical device (256–512 GB), the per-origin quota is on the order of tens to hundreds of gigabytes** — far more than the 40–250 MB needed for 20–50 photos.

Sources: [4], [5]

---

## 3. Can Stored Photos Be Retrieved Reliably for Upload?

### IndexedDB Retrieval

Yes. IndexedDB provides synchronous-style access via cursors and `get()` methods that return the stored value in full [2][6]. The W3C spec defines `IDBObjectStore.get()` and `IDBCursor` iteration for retrieving records [1]. Blob values stored in IndexedDB can be retrieved and used with `URL.createObjectURL()` or read via `FileReader` for upload [2].

### Cache API Retrieval

Yes. The Cache API provides `Cache.match(request)` and `Cache.matchAll(request)` to retrieve stored `Response` objects [3][7]. The response body can be read via `response.blob()`, `response.arrayBuffer()`, or `response.text()` [3]. MDN notes that `Cache.match()` returns a Promise that resolves to the matching response, which can then be used for upload [3].

### Reliability Considerations

- **Data persistence:** By default, browser-stored data is "best-effort" — it persists as long as the origin is below its quota, the device has enough storage, and the user doesn't manually delete it [4].
- **Browser shutdown:** IndexedDB transactions may be aborted on browser shutdown. The `complete` event is fired after the OS is told to write data, but there is a small chance of data loss if the OS crashes before flush [6]. Using `readwriteflush` mode (Firefox experimental) or `navigator.storage.persist()` mitigates this [4][6].
- **Connectivity return:** There is no issue retrieving data when connectivity returns. IndexedDB and Cache API data is stored on disk and is fully available offline. Retrieval does not depend on network state.

**Verdict:** Both APIs provide reliable retrieval of stored photos for upload when connectivity returns.

---

## 4. What Happens When Storage Quotas Are Exceeded?

### Error Handling

When an origin's quota is exceeded, attempting to store more data using IndexedDB, Cache API, or OPFS fails with a `QuotaExceededError` exception [4][8]. MDN explicitly states: "Web developers should wrap JavaScript that writes to browser storage within `try...catch` blocks" [4].

### Eviction Policies

#### Storage Pressure Eviction (All Browsers)

When the device is running low on storage space, browsers use a **Least Recently Used (LRU)** policy [4]:

1. The data from the least recently used origin is deleted entirely.
2. If pressure continues, the browser moves to the second least recently used origin, and so on.
3. This only applies to best-effort origins; persistent origins are skipped [4].

#### Browser Maximum Storage Exceeded Eviction

Some browsers define a maximum total storage space (e.g., Chrome uses at most 80% of total disk). When all origins combined exceed this, the browser starts evicting best-effort origins using LRU [4].

#### Proactive Eviction (Safari Only)

Safari proactively evicts data for origins that have had no user interaction (click or tap) in the last seven days of browser use, when cross-site tracking prevention is enabled [4].

### All-or-Nothing Deletion

When an origin's data is evicted, **all of its data is deleted at once** — not parts of it. If the origin used both IndexedDB and Cache API, both are deleted together [4]. This is intentional to avoid inconsistency.

### Persistent Storage as Protection

An origin can request persistent storage via `navigator.storage.persist()`, which changes the storage bucket mode from "best-effort" to "persistent" [4][9]. Persistent data is only evicted if the user explicitly chooses to clear it via browser settings [4][9]. Chrome automatically grants or denies this request based on site engagement heuristics (bookmarking, push notifications, user interaction frequency) [9]. Firefox shows a UI popup requesting user permission [9].

### Quota Estimation

Developers can check available space using `navigator.storage.estimate()`, which returns `{ usage, quota }` in bytes [10][11]. The values are conservative estimates — user agents pad them to avoid fingerprinting [10][11]. This can be used to proactively check if there is enough space before storing photos.

**Verdict:** When quotas are exceeded, writes fail with `QuotaExceededError`. Browsers evict entire origins using LRU under storage pressure. Using `navigator.storage.persist()` is the primary mechanism to protect critical data from eviction.

---

## 5. Summary and Recommendations

### Is Browser Storage Sufficient?

**Yes.** For 20–50 photos at 2–5 MB each (40–250 MB total), browser storage is more than sufficient on virtually all modern devices. The per-origin quota on all major browsers is on the order of tens to hundreds of gigabytes, dwarfing the required storage.

### Recommended Approach

1. **Use IndexedDB** for storing photo blobs. It is the most flexible API for storing and retrieving binary data, supports indexing, and has the most mature browser support [2][6].
2. **Alternatively, use Cache API** if the photos are naturally represented as HTTP responses (e.g., fetched from a server) [3][7].
3. **Request persistent storage** via `navigator.storage.persist()` to protect photos from LRU eviction under storage pressure [4][9].
4. **Wrap all write operations in `try...catch`** to handle `QuotaExceededError` gracefully [4].
5. **Check available space** with `navigator.storage.estimate()` before storing large batches of photos [10][11].
6. **Use `relaxed` durability** for photo storage (ephemeral data), or `strict` if the photos are irreplaceable [1].

### Key Risks

- **Best-effort eviction:** Without persistent storage, photos may be deleted under storage pressure or LRU eviction [4].
- **Private browsing:** Data is deleted when the private browsing session ends [4].
- **User-initiated clearing:** Users can manually clear all site data via browser settings, which deletes everything [4].
- **QuotaExceededError:** If the device has very little free disk space, even the dynamic quota may be too small — though this is unlikely on modern devices [4].

---

## References

[1] Indexed Database API 3.0 — W3C Working Draft, 13 August 2025: https://w3c.github.io/IndexedDB/

[2] IndexedDB API — MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

[3] Cache — MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Cache

[4] Storage quotas and eviction criteria — MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria

[5] Updates to Storage Policy — WebKit Blog, 10 August 2023: https://webkit.org/blog/14403/updates-to-storage-policy/

[6] Using IndexedDB — MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB

[7] CacheStorage — MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage

[8] Storage Standard — WHATWG Living Standard: https://storage.spec.whatwg.org/

[9] Persistent storage — web.dev: https://web.dev/articles/persistent-storage

[10] StorageManager: estimate() — MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate

[11] Storage API — MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API
