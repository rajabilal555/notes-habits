import { router } from '@inertiajs/react';
import HabitController from '@/actions/App/Http/Controllers/HabitController';
import type { HeatmapCell } from '@/types/habit';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function cellClass(cell: HeatmapCell): string {
    if (cell.future) {
        return 'bg-transparent';
    }

    if (cell.completed) {
        return cell.scheduled
            ? 'bg-emerald-500 dark:bg-emerald-600'
            : 'bg-emerald-500/60 dark:bg-emerald-600/60';
    }

    if (cell.scheduled) {
        return 'bg-muted-foreground/25';
    }

    return 'bg-muted/40';
}

function cellAriaLabel(cell: HeatmapCell): string {
    if (cell.future) {
        return `${cell.date} (upcoming)`;
    }

    if (cell.completed) {
        return `Completed on ${cell.date}, click to unmark`;
    }

    return `Not completed on ${cell.date}, click to mark`;
}

export function HabitHeatmapStrip({
    heatmap,
    habitId,
    compact = false,
    reloadOnly,
}: {
    heatmap: HeatmapCell[][];
    habitId: number;
    compact?: boolean;
    reloadOnly?: string[];
}) {
    const cellSize = compact ? 20 : 28;

    const toggleDate = (date: string) => {
        router.patch(
            HabitController.toggleCompletion.url(habitId),
            { date },
            {
                preserveScroll: true,
                ...(reloadOnly ? { only: reloadOnly } : {}),
            },
        );
    };

    return (
        <div className="inline-flex flex-col gap-1">
            <div
                className="grid gap-[3px]"
                style={{
                    gridTemplateColumns: `repeat(7, ${cellSize}px)`,
                }}
            >
                {DAY_LABELS.map((label, dayIndex) => (
                    <span
                        key={`label-${dayIndex}`}
                        className={cn(
                            'text-muted-foreground text-center leading-none',
                            compact ? 'text-[8px]' : 'text-[10px]',
                        )}
                    >
                        {label}
                    </span>
                ))}
            </div>

            {heatmap.map((week, weekIndex) => (
                <div
                    key={`week-${weekIndex}`}
                    className="grid gap-[3px]"
                    style={{
                        gridTemplateColumns: `repeat(7, ${cellSize}px)`,
                    }}
                >
                    {week.map((cell) => (
                        <button
                            key={cell.date}
                            type="button"
                            disabled={cell.future}
                            onClick={() => toggleDate(cell.date)}
                            title={cell.date}
                            aria-label={cellAriaLabel(cell)}
                            style={{
                                width: cellSize,
                                height: cellSize,
                            }}
                            className={cn(
                                'rounded-[3px] p-0',
                                cellClass(cell),
                                !cell.future &&
                                    'hover:ring-ring cursor-pointer hover:ring-2 hover:ring-offset-1',
                            )}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
