# 07: Habit create and daily completion

**What to build:** A signed-in user can create habits on `/habits`. Cadence is daily or specific weekdays (e.g. Mon/Wed/Fri) — no custom N-day interval in v1. User marks today complete/incomplete for each habit. Current streak count displays per habit. Strict streak logic: missing a scheduled day breaks the streak immediately.

**Blocked by:** 01 App identity and navigation shell

**Status:** done

- [x] `habits` table: user_id, name, cadence (daily | weekdays), weekdays bitmask or equivalent for weekday selection
- [x] `habit_completions` table: habit_id, completed_date (date, unique per habit)
- [x] Create/edit/delete habit with cadence picker
- [x] Toggle today's completion on `/habits`
- [x] Streak count computed with strict reset rules
- [x] Feature tests for daily habit, weekday habit, streak build, and streak break on missed day
