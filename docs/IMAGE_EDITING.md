# Image Editing Pattern (Admin)

This document explains how to make images editable from the admin dashboard using the project's components.

Core pieces

- `EditableImage` (`src/components/admin/media/EditableImage.tsx`)
  - Small wrapper that shows an image (or placeholder) with an edit button.
  - Opens `MediaPicker` and calls `onChange(url)` with the selected image URL.

- `MediaPicker` (`src/components/admin/media/MediaPicker.tsx`)
  - Modal media library UI to browse, search, upload and select images.
  - Accepts `triggerElement`, `externalOpen`, and `onExternalOpenChange` props for programmatic control.

- `AdminImageOverlay` (`src/components/admin/AdminImageOverlay.tsx`)
  - Global layer that places edit buttons next to images (`<img>`) inside the admin area (`main` element).
  - When an image is edited, if the image has a `data-admin-key` attribute, that value is persisted via `setSiteSetting(key, url)`.

How to mark images for automatic persistence

- Add a `data-admin-key` attribute to any `<img>` you want admins to be able to edit and persist to site settings.
  - Example: `<img src={hero} data-admin-key="site.heroImage" ... />`
- The `AdminImageOverlay` will detect the image and when an admin replaces it with a gallery image, the overlay will call `setSiteSetting(key, url)`.

Manual integration

- To allow inline editing without the overlay, replace an `<img>` in admin routes/components with `EditableImage` and pass `onChange` that persists the change as needed.
  - Example: in `src/routes/_authenticated/admin/chambres.tsx` we used `EditableImage` to let admins update room photos and saved the new `url` to the `room_photos` table.

Notes & tips

- Images that should not be editable can be marked with `data-admin-no-edit="true"` (overlay ignores them).
- The overlay only scans images inside the `main` element to avoid showing edit buttons in the left admin sidebar.
- CSS for large thumbnails is in `src/styles.css` (media picker). You can tweak `min-height` there to adjust thumbnail size across the picker.

If you want, I can:
- Automatically replace more `<img>` occurrences with `EditableImage` across the admin routes.
- Add a dedicated admin UI to manage all `data-admin-key` mappings.

