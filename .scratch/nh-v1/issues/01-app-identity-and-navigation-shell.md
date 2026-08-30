# 01: App identity and navigation shell

**What to build:** The app reads as N&H, not the Laravel starter kit. Branding (app name, logo area) reflects Notes & Habits. Sidebar navigation includes Dashboard, Notes, and Habits. Starter-kit footer links (Repository, Documentation) are removed. The dashboard page has named placeholder sections for **Due Today** and **Habits** — no notes preview on the dashboard (full notes grid lives on `/notes`).

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `APP_NAME` and visible UI branding say N&H (or "Notes & Habits")
- [x] Sidebar nav: Dashboard, Notes, Habits — each route exists and renders a page shell
- [x] Dashboard shows empty Due Today and Habits sections (placeholders, ready to wire in later tickets)
- [x] Starter-kit demo cruft removed from nav/footer
- [x] Authenticated layout unchanged in spirit — still uses existing app shell
