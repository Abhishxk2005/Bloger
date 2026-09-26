# AKC WebCraft Blogger

A responsive blog with a separate browser-based writing dashboard.

## Run it

Open `index.html` in a modern browser. No package installation or build step is required.

- Public journal: `index.html`
- Admin dashboard: `admin.html` (separate file, not linked from the public journal)
- New post: choose **New post** in the admin dashboard

## Publishing

Create posts, edit drafts, publish or unpublish them, feature one post on the homepage, filter and search the journal, and remove posts from the dashboard. Choose a cover image from your computer or use an image URL. Uploaded covers are resized to WebP and stored with their posts. Posts are saved in this browser's local storage. Use **Download backup** and **Restore backup** in the dashboard to move or preserve your post data.

The included sample articles are starter content. Cover photos and display fonts load from external services, so those assets need an internet connection; the site layout and editor work locally.

## Important limits

This static version is intended for one person's local use. It has no server, account login, or cross-device synchronization. The public journal does not link to the admin file, but anyone with direct access to `admin.html` can open it; a separate file is not authentication. Do not deploy it as a public multi-user blog without adding server-side access control and storage.
