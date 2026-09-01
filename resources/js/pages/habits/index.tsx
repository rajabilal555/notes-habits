import { Head } from '@inertiajs/react';
import { Flame, Plus } from 'lucide-react';
import { useState } from 'react';
import { HabitFormSheet } from '@/components/habits/habit-form-sheet';
import { HabitHeatmapStrip } from '@/components/habits/habit-heatmap-strip';
import { HabitTodayToggle } from '@/components/habits/habit-today-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { index as habitsIndex } from '@/routes/habits';
import type { Habit } from '@/types/habit';

type HabitsIndexProps = {
    habits: Habit[];
};

export default function HabitsIndex({ habits }: HabitsIndexProps) {
    const [sheetOpen, setSheetOpen] = useState(false);
    const [activeHabitId, setActiveHabitId] = useState<number | null>(null);

    const openCreate = () => {
        setActiveHabitId(null);
        setSheetOpen(true);
    };

    const openHabit = (habitId: number) => {
        setActiveHabitId(habitId);
        setSheetOpen(true);
    };

    return (
        <>
            <Head title="Habits" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Habits
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Track recurring routines and streaks.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus className="size-4" />
                        New habit
                    </Button>
                </header>

                {habits.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            No habits yet. Create one to start tracking.
                        </p>
                        <Button variant="outline" onClick={openCreate}>
                            <Plus className="size-4" />
                            New habit
                        </Button>
                    </div>
                ) : (
                    <div className="grid [grid-template-columns:repeat(auto-fill,minmax(15.5rem,1fr))] gap-4">
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
                                        <h2
                                            className={cn(
                                                'truncate font-medium',
                                                habit.completed_today &&
                                                    'text-muted-foreground line-through',
                                            )}
                                        >
                                            {habit.name}
                                        </h2>
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
                                    onClick={(event) => event.stopPropagation()}
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

HabitsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Habits',
            href: habitsIndex(),
        },
    ],
};
