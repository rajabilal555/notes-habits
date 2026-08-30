# 10: Dashboard home integration

**What to build:** The dashboard becomes the glanceable home screen for the always-on kiosk: **Due Today** notes (from ticket 06) and stacked **habit heatmap strips** (from ticket 08). No notes grid or pinned-notes preview on the dashboard — full notes live on `/notes`. Layout is uncluttered and ADHD-friendly: clear sections, minimal chrome, readable at a glance from across the room or on phone.

**Blocked by:** 06 Note reminders and due-today, 08 Habit heatmap strips

**Status:** done

- [x] Dashboard Due Today section fully wired (not placeholder)
- [x] Dashboard Habits section shows heatmap strips for all active habits (or top N with sensible empty state)
- [x] No notes masonry/grid on dashboard
- [x] Sections have clear headings and empty states ("Nothing due today", "No habits yet")
- [x] Layout works on phone and kiosk laptop viewport
- [x] `/dashboard` (or `/`) is the natural post-login landing
