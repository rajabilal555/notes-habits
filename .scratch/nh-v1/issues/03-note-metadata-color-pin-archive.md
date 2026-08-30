# 03: Note metadata — color, pin, archive

**What to build:** Notes support color, pin-to-top, and archive. Pinned notes sort first on `/notes`. Archived notes move off the main grid and are accessible at `/notes/archived` (separate route). User can unarchive from the archived view.

**Blocked by:** 02 Plain note capture and grid

**Status:** done

- [x] `notes` gains: color (enum or string, sensible palette), is_pinned (bool), archived_at (nullable timestamp)
- [x] Color picker on note create/edit
- [x] Pin/unpin toggle; pinned notes appear before unpinned on `/notes`
- [x] Archive action removes note from `/notes`; `/notes/archived` lists archived notes only
- [x] Unarchive returns note to `/notes`
- [x] Feature tests for pin order, archive, and separate archived route
