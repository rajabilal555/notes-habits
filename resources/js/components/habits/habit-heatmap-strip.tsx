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

export function HabitHeatmapStrip({
    heatmap,
    compact = false,
}: {
    heatmap: HeatmapCell[][];
    compact?: boolean;
}) {
    const weeks = heatmap.length;
    const cellSize = compact ? 8 : 10;

    return (
        <div
            className="inline-grid gap-[2px]"
            style={{
                gridTemplateColumns: `1rem repeat(${weeks}, ${cellSize}px)`,
                gridTemplateRows: `repeat(7, ${cellSize}px)`,
            }}
        >
            {DAY_LABELS.map((label, dayIndex) => (
                <span
                    key={`label-${dayIndex}`}
                    className={cn(
                        'text-muted-foreground flex items-center leading-none',
                        compact ? 'text-[8px]' : 'text-[9px]',
                    )}
                    style={{ gridRow: dayIndex + 1, gridColumn: 1 }}
                >
                    {label}
                </span>
            ))}

            {heatmap.flatMap((week, weekIndex) =>
                week.map((cell, dayIndex) => (
                    <div
                        key={`${weekIndex}-${dayIndex}`}
                        title={cell.date}
                        style={{
                            gridRow: dayIndex + 1,
                            gridColumn: weekIndex + 2,
                        }}
                        className={cn('rounded-[2px]', cellClass(cell))}
                    />
                )),
            )}
        </div>
    );
}
