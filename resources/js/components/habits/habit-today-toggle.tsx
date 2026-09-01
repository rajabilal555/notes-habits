import { router } from '@inertiajs/react';
import { Check } from 'lucide-react';
import HabitController from '@/actions/App/Http/Controllers/HabitController';
import { cn } from '@/lib/utils';

type HabitTodayToggleProps = {
    habitId: number;
    habitName: string;
    completed: boolean;
    scheduled: boolean;
    reloadOnly?: string[];
    className?: string;
};

export function HabitTodayToggle({
    habitId,
    habitName,
    completed,
    scheduled,
    reloadOnly,
    className,
}: HabitTodayToggleProps) {
    const toggleToday = () => {
        router.patch(
            HabitController.toggleCompletion.url(habitId),
            {},
            {
                preserveScroll: true,
                ...(reloadOnly ? { only: reloadOnly } : {}),
            },
        );
    };

    return (
        <button
            type="button"
            onClick={(event) => {
                event.stopPropagation();
                toggleToday();
            }}
            aria-label={
                completed
                    ? `Mark ${habitName} incomplete for today`
                    : `Mark ${habitName} complete for today`
            }
            aria-pressed={completed}
            className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                completed
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : scheduled
                      ? 'border-muted-foreground/40 hover:border-emerald-500/70 hover:bg-emerald-500/10'
                      : 'border-muted-foreground/25 text-muted-foreground/50 hover:border-muted-foreground/40',
                className,
            )}
        >
            {completed ? <Check className="size-4 stroke-[3]" /> : null}
        </button>
    );
}
