# 05: Labels on notes

**What to build:** User can create labels, assign one or more labels to a note, and filter the notes grid by label. Labels are user-scoped.

**Blocked by:** 02 Plain note capture and grid

**Status:** done

- [x] `labels` table (user_id, name, color optional) and `label_note` pivot
- [x] Assign/remove labels on note create/edit
- [x] Label chips visible on note cards
- [x] Filter control on `/notes` to show notes matching a selected label
- [x] Feature test covers label create, assign, and filter
