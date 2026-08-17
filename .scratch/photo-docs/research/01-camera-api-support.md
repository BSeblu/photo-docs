# Browser Camera API Support for One-Interaction-Per-Photo Capture

## 1. Can getUserMedia Keep the Camera Stream Alive Between Captures?

**Yes.** `navigator.mediaDevices.getUserMedia()` returns a `MediaStream` whose tracks remain live until explicitly stopped. The stream persists across multiple capture operations without needing to re-acquire the camera.

The `MediaStreamTrack` interface provides a `stop()` method that ends the track and releases the hardware resource. As long as the track is not stopped, the camera stays open and the video feed continues. The spec states that a track's `readyState` remains `"live"` until it is explicitly stopped or the source is disconnected [1].

The `MediaStream` object remains active as long as it has at least one live track. When all tracks are stopped or ended, the stream becomes inactive [2].

**Key implication for one-interaction-per-photo:** A webapp can call `getUserMedia()` once, attach the stream to a `<video>` element, and then call capture operations (via canvas, `ImageCapture`, or `captureStream()`) repeatedly without re-requesting camera permission or reopening the camera.

**Source:** MDN, "MediaDevices: getUserMedia()" — https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
**Source:** W3C, "Media Capture and Streams" spec, §MediaStreamTrack life-cycle — https://w3c.github.io/mediacapture-main/

---

## 2. Can a Single Tap Trigger Photo Capture from a `<video>` Element?

**Yes, via multiple approaches:**

### Approach A: Canvas + `drawImage` (widely supported)
The MDN "Taking still photos with getUserMedia()" guide demonstrates the canonical pattern: a `<video>` element receives the `getUserMedia()` stream, and a single button click triggers `takePicture()`, which calls `canvas.getContext('2d').drawImage(video, ...)` then `canvas.toDataURL('image/png')` [3]. This approach works in all major browsers and requires no special APIs beyond the standard Canvas API.

### Approach B: `HTMLMediaElement.captureStream()` (limited availability)
The `captureStream()` method on `<video>` returns a `MediaStream` that captures the video element's rendered content in real time. This stream can then be used for WebRTC or further processing [4]. However, MDN marks this feature as "Limited availability" — it is not Baseline and does not work in some widely-used browsers (notably Safari) [4].

**Source:** W3C, "Media Capture from DOM Elements" spec — https://w3c.github.io/mediacapture-fromelement/
**Source:** MDN, "HTMLMediaElement: captureStream()" — https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream

### Approach C: `ImageCapture` API (Chrome/Edge only)
The `ImageCapture` interface provides `takePhoto()` (returns a `Blob`) and `grabFrame()` (returns an `ImageBitmap`) directly from a `MediaStreamTrack` [5]. This is the most direct "single tap = one photo" API. However, browser compatibility is limited: it works in Chrome and Edge but is **not supported in Safari or Firefox** [5].

**Source:** MDN, "ImageCapture" — https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture
**Source:** W3C, "MediaStream Image Capture" spec — https://w3c.github.io/mediacapture-image/

### Approach D: `HTMLCanvasElement.captureStream()` (widely supported)
While not directly from `<video>`, the canvas approach (Approach A) can be combined with `HTMLCanvasElement.captureStream()` to create a persistent stream from the canvas for further processing. This method is Baseline and widely available since January 2020 [6].

**Source:** MDN, "HTMLCanvasElement: captureStream()" — https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream

---

## 3. Platform-Specific Limitations

### iOS Safari

- **getUserMedia works** on iOS Safari (since iOS 11), but requires a secure context (HTTPS) and user gesture for initial permission [1].
- **`<video>` autoplay and playback restrictions:** iOS Safari has historically required a user gesture to play `<video>`. Starting with iOS 10, WebKit relaxed these policies: muted videos and videos without audio tracks can autoplay without a gesture; videos with audio still require a user gesture to `play()` [7]. This is relevant because the `<video>` element must be playing to capture frames from it.
- **`captureStream()` on `<video>` is NOT supported** in Safari/iOS. MDN marks it as "Limited availability" and it does not work in Safari [4]. This means the direct `captureStream()` approach for photo capture is unavailable on iOS.
- **`ImageCapture` API is NOT supported** on iOS Safari.
- **The canvas `drawImage` approach (Approach A) works** on iOS Safari, making it the recommended path for one-interaction-per-photo on iOS.
- **`playsinline` attribute** is required on iPhone to prevent the `<video>` from entering fullscreen mode, which would obscure the UI [7].

**Source:** WebKit, "New `<video>` Policies for iOS" — https://webkit.org/blog/6784/new-video-policies-for-ios/
**Source:** MDN compatibility data for `captureStream()` and `ImageCapture`

### Android Chrome

- **getUserMedia works** on Android Chrome (since Chrome 53, September 2016) [1].
- **`captureStream()` on `<video>` works** in Chrome, making Approach B viable on Android.
- **`ImageCapture` API works** in Chrome, making Approach C viable on Android.
- **Canvas `drawImage` approach (Approach A) works** on all Android browsers.
- Android Chrome does not impose the same user-gesture-only playback restrictions as iOS Safari.

**Source:** MDN, "MediaDevices: getUserMedia()" — browser compatibility section
**Source:** MDN, "HTMLMediaElement: captureStream()" — browser compatibility section

### Tablets

- Tablets follow the platform behavior of their respective operating systems:
  - **iPadOS** follows iOS Safari behavior (getUserMedia works, captureStream on video not supported, canvas approach works).
  - **Android tablets** follow Android Chrome behavior (all approaches work).

---

## 4. Camera Persistence When Switching Apps or Screen Locks

### What the spec says

The W3C Media Capture and Streams spec defines explicit behavior for track life-cycle when the document visibility changes [2]:

> "When a `MediaStreamTrack` becomes muted or disabled, and this brings all tracks connected to the device to be either muted, disabled, or stopped, then the UA SHOULD relinquish the device within 3 seconds while allowing time for a reasonably-observant user to become aware of the transition. The UA SHOULD attempt to reacquire the device as soon as any live track sourced by the device becomes both unmuted and enabled again, provided that track's relevant global object's associated Document is in view at that time. If the document is not in view at that time, the UA SHOULD instead queue a task to mute the track, and not queue a task to unmute it until the document comes into view."

### Practical implications

- **App switch / backgrounding:** When the user switches away from the browser (e.g., opens another app), the document becomes non-visible. The browser may mute or stop the camera track. When the user returns, the browser should attempt to reacquire the camera, but the track may have ended and the stream may need to be recreated.
- **Screen lock:** When the screen locks, the document becomes non-visible. The same behavior applies — the browser may stop the camera track. Upon unlocking, the stream may or may not still be alive depending on the browser's implementation.
- **iOS Safari** is known to aggressively suspend `getUserMedia` streams when the app backgrounds or the screen locks. The stream may not automatically resume; the page may need to re-request `getUserMedia()` and re-attach the stream to the `<video>` element.
- **Android Chrome** also suspends camera access when the app backgrounds, but tends to resume more gracefully when the app returns to the foreground.

### Recommendation for the one-interaction-per-photo model

The app should listen for the `visibilitychange` event on the document and the `ended` event on `MediaStreamTrack` objects. If the track ends due to app switching or screen lock, the app should re-acquire the camera stream when the page becomes visible again. The user will need to re-grant permission if the browser has revoked it.

**Source:** W3C, "Media Capture and Streams" spec, §MediaStreamTrack life-cycle — https://w3c.github.io/mediacapture-main/

---

## 5. Summary and Recommendation

| Capability | iOS Safari | Android Chrome | Notes |
|---|---|---|---|
| `getUserMedia()` | ✅ (HTTPS + user gesture) | ✅ | Stream stays alive until `track.stop()` |
| Canvas `drawImage(video)` capture | ✅ | ✅ | Most reliable cross-platform approach |
| `<video>.captureStream()` | ❌ Not supported | ✅ | Limited availability; not Baseline |
| `ImageCapture.takePhoto()` | ❌ Not supported | ✅ | Chrome/Edge only |
| `ImageCapture.grabFrame()` | ❌ Not supported | ✅ | Chrome/Edge only |
| `canvas.captureStream()` | ✅ | ✅ | Baseline since Jan 2020 |
| Stream survives app switch | ⚠️ May be suspended | ⚠️ May be suspended | Re-acquire on `visibilitychange` |
| Stream survives screen lock | ⚠️ May be suspended | ⚠️ May be suspended | Re-acquire on `visibilitychange` |

**Recommended approach for one-interaction-per-photo:** Use the canvas `drawImage` approach (Approach A). It is the only approach that works consistently across all platforms (iOS Safari, Android Chrome, tablets). Call `getUserMedia()` once, keep the stream alive, and on each tap, draw the current video frame to a hidden canvas and export it as a PNG via `canvas.toDataURL()`.

**Source:** MDN, "Taking still photos with getUserMedia()" — https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos

---

## References

1. MDN, "MediaDevices: getUserMedia()" — https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
2. W3C, "Media Capture and Streams" spec — https://w3c.github.io/mediacapture-main/
3. MDN, "Taking still photos with getUserMedia()" — https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
4. MDN, "HTMLMediaElement: captureStream()" — https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/captureStream
5. MDN, "ImageCapture" — https://developer.mozilla.org/en-US/docs/Web/API/ImageCapture
6. MDN, "HTMLCanvasElement: captureStream()" — https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream
7. WebKit, "New `<video>` Policies for iOS" — https://webkit.org/blog/6784/new-video-policies-for-ios/
8. W3C, "Media Capture from DOM Elements" spec — https://w3c.github.io/mediacapture-fromelement/
9. W3C, "MediaStream Image Capture" spec — https://w3c.github.io/mediacapture-image/
10. MDN, "MediaCapture and Streams API" — https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API
11. MDN, "CanvasCaptureMediaStreamTrack" — https://developer.mozilla.org/en-US/docs/Web/API/CanvasCaptureMediaStreamTrack
12. MDN, "MediaStream Image Capture API" — https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Image_Capture_API
