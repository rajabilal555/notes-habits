import { Head, Link } from '@inertiajs/react';
import { Bell, Flame, Plus } from 'lucide-react';
import { useState } from 'react';
import { DashboardSection } from '@/components/dashboard-section';
import { HabitFormSheet } from '@/components/habits/habit-form-sheet';
import { HabitHeatmapStrip } from '@/components/habits/habit-heatmap-strip';
import { HabitTodayToggle } from '@/components/habits/habit-today-toggle';
import { Button } from '@/components/ui/button';
import { formatReminder } from '@/lib/datetime-local';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as habitsIndex } from '@/routes/habits';
import { index as notesIndex } from '@/routes/notes';
import type { Habit } from '@/types/habit';

const cardGridClassName =
    'grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(15.5rem,1fr))]';

type DueTodayNote = {
    id: number;
    title: string | null;
    reminder_at: string;
};

type DashboardProps = {
    dueToday: DueTodayNote[];
    habits: Habit[];
};

export default function Dashboard({ dueToday, habits }: DashboardProps) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [activeHabitId, setActiveHabitId] = useState<number | null>(null);

    const openHabit = (habitId: number) => {
        setActiveHabitId(habitId);
        setSheetOpen(true);
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <DashboardSection
                    title="Due Today"
                    description="Notes with a reminder for today"
                >
                    {dueToday.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Nothing due today.
                        </p>
                    ) : (
                        <div className={cardGridClassName}>
                            {dueToday.map((note) => (
                                <Link
                                    key={note.id}
                                    href={notesIndex()}
                                    className="border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/30 flex flex-col rounded-xl border p-4 transition-colors"
                                >
                                    <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
                                        <Bell className="size-3.5 shrink-0" />
                                        <span>
                                            {formatReminder(note.reminder_at)}
                                        </span>
                                    </div>
                                    <h3 className="line-clamp-2 font-medium">
                                        {note.title?.trim() || 'Untitled'}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    )}
                </DashboardSection>

                <DashboardSection
                    title="Habits"
                    description="Your recurring routines at a glance"
                    action={
                        habits.length > 0 ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={habitsIndex()}>View all</Link>
                            </Button>
                        ) : (
                            <Button size="sm" asChild>
                                <Link href={habitsIndex()}>
                                    <Plus className="size-4" />
                                    Add habit
                                </Link>
                            </Button>
                        )
                    }
                >
                    {habits.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                            No habits yet.
                        </p>
                    ) : (
                        <div className={cardGridClassName}>
                            {habits.map((habit) => (
                                <article
                                    key={habit.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openHabit(habit.id)}
                                    onKeyDown={(event) => {
                                        if (
                                            event.key === 'Enter' ||
                                            event.key === ' '
                                        ) {
                                            event.preventDefault();
                                            openHabit(habit.id);
                                        }
                                    }}
                                    className="border-sidebar-border/70 dark:border-sidebar-border hover:bg-muted/30 flex cursor-pointer flex-col rounded-xl border p-4 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <h3
                                                className={cn(
                                                    'truncate font-medium',
                                                    habit.completed_today &&
                                                        'text-muted-foreground line-through',
                                                )}
                                            >
                                                {habit.name}
                                            </h3>
                                            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                                                <Flame className="size-3.5 shrink-0" />
                                                {habit.streak} day streak
                                            </span>
                                            <p className="text-muted-foreground text-xs">
                                                {habit.cadence === 'daily'
                                                    ? 'Every day'
                                                    : 'Selected weekdays'}
                                                {habit.completed_today
                                                    ? ' · done today'
                                                    : habit.scheduled_today
                                                      ? ' · due today'
                                                      : ' · not scheduled today'}
                                            </p>
                                        </div>
                                        <HabitTodayToggle
                                            habitId={habit.id}
                                            habitName={habit.name}
                                            completed={habit.completed_today}
                                            scheduled={habit.scheduled_today}
                                            reloadOnly={['habits']}
                                        />
                                    </div>
                                    <div
                                        className="mt-4 flex justify-center"
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                    >
                                        <HabitHeatmapStrip
                                            habitId={habit.id}
                                            heatmap={habit.heatmap}
                                            reloadOnly={['habits']}
                                        />
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </DashboardSection>
            </div>

            <HabitFormSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                habits={habits}
                habitId={activeHabitId}
            />
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
