# 08: Habit heatmap strips

**What to build:** Each habit on `/habits` shows a GitHub contribution-graph-style heatmap strip: colored grid cells for the last **12 weeks**, one row per habit. Completed scheduled days are filled; missed scheduled days are empty/dim. Built with plain Tailwind CSS grid — no charting library.

**Blocked by:** 07 Habit create and daily completion

**Status:** done

- [x] Reusable heatmap strip React component (Tailwind grid of cells)
- [x] Shows 12 weeks of history ending today
- [x] Only scheduled days are meaningful (daily = every day; weekdays = selected days only)
- [x] Cell color intensity or fill distinguishes completed vs not completed on scheduled days
- [x] Sized for roughly 3–8 habits stacked vertically
- [x] Feature test or unit test verifies grid data for a known completion history
