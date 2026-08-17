Label: wayfinder:grilling
Assignee: benjamin
Status: closed

## Question

What are the target devices and breakpoints for responsive design? Start with the smallest meaningful screen size (smartphones, ~320px) and define how the layout adapts as screen real estate increases (tablets, desktops). Which device categories are in scope for the spec?

## Resolution

**T-shirt sizes, not pixel breakpoints.** The spec defines three device categories: small (smartphone), medium (tablet). Desktop is out of scope. Approximate breakpoints: small = smartphones (e.g., iPhone, Samsung), medium = tablets.

Key responsive design decisions for the spec:
- **Orientation matters** for small and medium devices; the layout adapts on rotation automatically
- **Folder view:** Single folder at a time, list of subfolders and files, breadcrumb trail for navigation
- **Breadcrumb:** Always visible, shows current path, parent folder always accessible; compaction strategy (ellipsis, scrollable, expandable) is an implementation detail
- **Capture screen:** Full-screen modal tied to the folder where capture was started; cannot be left except by canceling or submitting
- **Photo strip:** Scrollable, always visible; at the bottom in portrait, right side in landscape; adapts on rotation; collapsible as an option
- **Submit:** Navigates back to folder view with toast notification ("uploading x photos...")
- **Cancel:** Confirmation modal, navigates back to folder view with toast notification ("canceled")
- **Upload status indicators:** Required for each photo in folder view (idle, processing, success, error); visual design is an implementation detail
- **Error handling:** Toast on error + error indicator on specific files; errors must be resolvable
- **Capture button:** Prominent, at the bottom on phones; placement on larger screens is implementation detail
- **Touch targets:** Must be big enough on small screens; specific sizes are implementation detail
- **Capture button placement on desktop:** Out of scope; webcam and file drop-zone deferred to implementation phase

Blocked by: 01-camera-api-support