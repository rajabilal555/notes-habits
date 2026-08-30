# N&H v1 — confirmed decisions

Decisions confirmed before ticket publish (2026-08-30).

| Topic                   | Decision                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Dashboard notes section | **None.** Dashboard shows Due Today + Habits only. Full notes grid lives on `/notes`.              |
| Archived notes          | **Separate route** at `/notes/archived`.                                                           |
| Reminder precision      | **Date + time** (e.g. "Today at 3pm").                                                             |
| Habit heatmap range     | **12 weeks** (~3 months).                                                                          |
| Label management        | In-app only (note popover). Users can create, assign, and delete their own labels. No admin panel. |
| Auth scoping            | Notes and habits scoped to authenticated user (multi-user safe; homelab likely single user).       |
| Streak logic            | Strict reset — missing a scheduled day breaks streak immediately. No grace/freeze.                 |
| Habit cadence (v1)      | Daily or specific weekdays only. No custom N-day interval.                                         |
| Reminder delivery (v1)  | Dashboard Due Today only. No push notifications.                                                   |
| Charts                  | None — hand-rolled Tailwind CSS grid for heatmaps.                                                 |
