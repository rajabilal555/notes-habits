import type { HeatmapCell } from '@/types/habit';
import { cn } from '@/lib/utils';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HabitHeatmapStrip({
    heatmap,
    compact = false,
}: {
    heatmap: HeatmapCell[][];
    compact?: boolean;
}) {
    const weeks = heatmap.length;
    const cellSize = compact ? 'size-2.5' : 'size-3';

    return (
        <div className="flex gap-2">
            {!compact ? (
                <div className="text-muted-foreground flex flex-col gap-[3px] pt-0.5 text-[10px] leading-none">
                    {DAY_LABELS.map((label, index) => (
                        <span key={index} className="flex h-3 items-center">
                            {index % 2 === 1 ? label : ''}
                        </span>
                    ))}
                </div>
            ) : null}
            <div
                className="grid gap-[3px]"
                style={{
                    gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
                    gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
                    gridAutoFlow: 'column',
                }}
            >
                {heatmap.flatMap((week, weekIndex) =>
                    week.map((cell, dayIndex) => (
                        <div
                            key={`${weekIndex}-${dayIndex}`}
                            title={cell.date}
                            className={cn(
                                cellSize,
                                'rounded-sm',
                                cell.future && 'bg-transparent',
                                !cell.future &&
                                    !cell.scheduled &&
                                    'bg-muted/40',
                                !cell.future &&
                                    cell.scheduled &&
                                    !cell.completed &&
                                    'bg-muted-foreground/25',
                                !cell.future &&
                                    cell.scheduled &&
                                    cell.completed &&
                                    'bg-emerald-500 dark:bg-emerald-600',
                            )}
                        />
                    )),
                )}
            </div>
        </div>
    );
}
