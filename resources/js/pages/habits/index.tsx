import { Head, router } from '@inertiajs/react';
import { Flame, Pencil, Plus } from 'lucide-react';
import { useState } from 'react';
import HabitController from '@/actions/App/Http/Controllers/HabitController';
import { HabitFormDialog } from '@/components/habits/habit-form-dialog';
import { HabitHeatmapStrip } from '@/components/habits/habit-heatmap-strip';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { index as habitsIndex } from '@/routes/habits';
import type { Habit } from '@/types/habit';

type HabitsIndexProps = {
    habits: Habit[];
};

export default function HabitsIndex({ habits }: HabitsIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeHabit, setActiveHabit] = useState<Habit | null>(null);

    const openCreate = () => {
        setActiveHabit(null);
        setDialogOpen(true);
    };

    const openEdit = (habit: Habit) => {
        setActiveHabit(habit);
        setDialogOpen(true);
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
                    <div className="flex flex-col gap-4">
                        {habits.map((habit) => (
                            <article
                                key={habit.id}
                                className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex min-w-0 flex-1 items-start gap-3">
                                        <Checkbox
                                            checked={habit.completed_today}
                                            onCheckedChange={() =>
                                                router.patch(
                                                    HabitController.toggleCompletion.url(
                                                        habit.id,
                                                    ),
                                                    {},
                                                    {
                                                        preserveScroll: true,
                                                    },
                                                )
                                            }
                                            className="mt-1"
                                            aria-label={`Mark ${habit.name} complete for today`}
                                        />
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-medium">
                                                    {habit.name}
                                                </h2>
                                                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                                                    <Flame className="size-3.5" />
                                                    {habit.streak} day streak
                                                </span>
                                            </div>
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
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEdit(habit)}
                                        aria-label={`Edit ${habit.name}`}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                </div>
                                <div className="mt-4 overflow-x-auto">
                                    <HabitHeatmapStrip heatmap={habit.heatmap} />
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <HabitFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                habit={activeHabit}
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
