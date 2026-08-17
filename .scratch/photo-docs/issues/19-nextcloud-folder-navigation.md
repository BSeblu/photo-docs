# 19 — Nextcloud folder navigation and breadcrumbs

**What to build:** A folder browser component using ShadCN UI that queries folder listings via the `StorageAdapter`, displays an interactive breadcrumb trail, and allows photographers to select or create the target Nextcloud folder for the capture session.

**Blocked by:** 12 — NextcloudStorageAdapter implementation

**Status:** ready-for-agent

- [ ] Displays list of subfolders in current Nextcloud path
- [ ] Clickable breadcrumb bar allows direct jumping to any ancestor folder
- [ ] Ability to create a new folder directly within the UI
- [ ] Selected folder becomes the active destination for subsequent photo sessions
- [ ] Works seamlessly with both `MockStorageAdapter` and `NextcloudStorageAdapter`
