import { Head, Link, router } from '@inertiajs/react';
import { Flame, Plus } from 'lucide-react';
import HabitController from '@/actions/App/Http/Controllers/HabitController';
import { DashboardSection } from '@/components/dashboard-section';
import { HabitHeatmapStrip } from '@/components/habits/habit-heatmap-strip';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatReminder } from '@/lib/datetime-local';
import { dashboard } from '@/routes';
import { index as habitsIndex } from '@/routes/habits';
import { index as notesIndex } from '@/routes/notes';
import type { Habit } from '@/types/habit';

type DueTodayNote = {
    id: number;
    title: string | null;
    body: string | null;
    reminder_at: string;
};

type DashboardProps = {
    dueToday: DueTodayNote[];
    habits: Habit[];
};

export default function Dashboard({ dueToday, habits }: DashboardProps) {
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
                        <ul className="space-y-2">
                            {dueToday.map((note) => (
                                <li
                                    key={note.id}
                                    className="border-sidebar-border/70 dark:border-sidebar-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate font-medium">
                                            {note.title?.trim() || 'Untitled'}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {formatReminder(note.reminder_at)}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={notesIndex()}>Notes</Link>
                                    </Button>
                                </li>
                            ))}
                        </ul>
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
                        <div className="space-y-4">
                            {habits.map((habit) => (
                                <article
                                    key={habit.id}
                                    className="border-sidebar-border/70 dark:border-sidebar-border rounded-lg border p-3"
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            {habit.scheduled_today ? (
                                                <Checkbox
                                                    checked={
                                                        habit.completed_today
                                                    }
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
                                                    aria-label={`Mark ${habit.name} complete for today`}
                                                />
                                            ) : null}
                                            <div className="min-w-0">
                                                <p className="truncate font-medium">
                                                    {habit.name}
                                                </p>
                                                <p className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                                                    <Flame className="size-3" />
                                                    {habit.streak} day streak
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <HabitHeatmapStrip
                                        heatmap={habit.heatmap}
                                        compact
                                    />
                                </article>
                            ))}
                        </div>
                    )}
                </DashboardSection>
            </div>
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
