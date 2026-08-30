# 04: Checklist notes

**What to build:** A note can contain checkbox sub-items. User can add, check/uncheck, reorder, and remove items. Checked progress is visible on the note card (e.g. "2/5"). A note can be text-only, checklist-only, or both (title + checklist items).

**Blocked by:** 02 Plain note capture and grid

**Status:** done

- [x] `note_items` table: note_id, text, is_checked, sort_order
- [x] Checklist UI on note card and in edit flow
- [x] Add/remove/reorder/check items persists correctly
- [x] Progress indicator on card when items exist
- [x] Feature test covers checklist CRUD and progress display
