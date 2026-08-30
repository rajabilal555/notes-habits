# 06: Note reminders and due-today section

**What to build:** A note can have a reminder datetime (date + time, e.g. "Today at 3pm"). The dashboard **Due Today** section lists notes whose reminder falls on the current calendar day (in app timezone). No push notifications — surfacing on the always-visible dashboard is sufficient for v1.

**Blocked by:** 01 App identity and navigation shell, 02 Plain note capture and grid

**Status:** done

- [x] `notes` gains `reminder_at` (nullable datetime)
- [x] Reminder picker on note create/edit (date + time)
- [x] Dashboard Due Today section (placeholder from ticket 01) lists matching notes with title/body preview and link to note
- [x] Notes without a reminder do not appear in Due Today
- [x] Feature test covers reminder set and due-today query for today's date
