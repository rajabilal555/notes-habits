# 02: Plain note capture and grid

**What to build:** A signed-in user can create, edit, and delete plain text notes on `/notes`. Notes appear in a responsive grid. Title is optional (Keep-style). All data scoped to the authenticated user.

**Blocked by:** 01 App identity and navigation shell

**Status:** done

- [x] `notes` table: user_id, title (nullable), body (nullable), timestamps
- [x] Full CRUD via Inertia: create, inline or modal edit, delete
- [x] `/notes` page lists active (non-archived) notes in a grid
- [x] Empty state when no notes exist
- [x] Feature test covers create → list → update → delete for authenticated user
- [x] User cannot see or modify another user's notes
