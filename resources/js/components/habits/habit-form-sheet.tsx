import { Form } from '@inertiajs/react';
import { Flame, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import HabitController from '@/actions/App/Http/Controllers/HabitController';
import { HabitHeatmapStrip } from '@/components/habits/habit-heatmap-strip';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { Habit } from '@/types/habit';

const WEEKDAYS = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
];

const fieldClassName =
    'border-0 bg-transparent px-0 shadow-none focus-visible:ring-0';

type HabitFormSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    habits: Habit[];
    habitId?: number | null;
};

export function HabitFormSheet({
    open,
    onOpenChange,
    habits,
    habitId = null,
}: HabitFormSheetProps) {
    const habit =
        habitId === null
            ? null
            : (habits.find((entry) => entry.id === habitId) ?? null);
    const isEditing = habit !== null;
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [cadence, setCadence] = useState<'daily' | 'weekdays'>('daily');
    const [weekdays, setWeekdays] = useState<number[]>([]);

    useEffect(() => {
        if (!open) {
            setConfirmDelete(false);
            return;
        }

        setCadence(habit?.cadence ?? 'daily');
        setWeekdays(habit?.weekdays ?? [1, 2, 3, 4, 5]);
    }, [open, habit]);

    const toggleWeekday = (day: number) => {
        setWeekdays((current) =>
            current.includes(day)
                ? current.filter((value) => value !== day)
                : [...current, day].sort((a, b) => a - b),
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex h-full w-full flex-col gap-0 p-0 md:max-w-md [&>button]:hidden"
            >
                <SheetTitle className="sr-only">
                    {isEditing ? habit.name : 'New habit'}
                </SheetTitle>

                {isEditing && confirmDelete ? (
                    <div className="space-y-4 p-5">
                        <p className="text-muted-foreground text-sm">
                            Delete this habit and its completion history?
                        </p>
                        <Form
                            {...HabitController.destroy.form(habit.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={() => onOpenChange(false)}
                        >
                            {({ processing }) => (
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setConfirmDelete(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="destructive"
                                        disabled={processing}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </div>
                ) : (
                    <Form
                        {...(isEditing
                            ? HabitController.update.form(habit.id)
                            : HabitController.store.form())}
                        transform={(data) => ({
                            ...data,
                            cadence,
                            weekdays: cadence === 'weekdays' ? weekdays : [],
                        })}
                        options={{ preserveScroll: true }}
                        onSuccess={() => onOpenChange(false)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="flex shrink-0 items-start gap-2 border-b px-4 py-4">
                                    <div className="min-w-0 flex-1 space-y-3">
                                        <Input
                                            id="habit-name"
                                            name="name"
                                            defaultValue={habit?.name ?? ''}
                                            placeholder="Habit name"
                                            className={cn(
                                                fieldClassName,
                                                'text-base font-semibold',
                                            )}
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="shrink-0"
                                        onClick={() => onOpenChange(false)}
                                        aria-label="Close"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>

                                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="habit-description">
                                            Description
                                        </Label>
                                        <textarea
                                            id="habit-description"
                                            name="description"
                                            defaultValue={
                                                habit?.description ?? ''
                                            }
                                            placeholder="Why this habit matters, or how to do it..."
                                            rows={3}
                                            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]"
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>

                                    {isEditing ? (
                                        <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                            <Flame className="size-4 shrink-0" />
                                            {habit.streak} day streak
                                        </div>
                                    ) : null}

                                    <div className="grid gap-2">
                                        <Label>Cadence</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={
                                                    cadence === 'daily'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setCadence('daily')
                                                }
                                            >
                                                Daily
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={
                                                    cadence === 'weekdays'
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    setCadence('weekdays')
                                                }
                                            >
                                                Specific days
                                            </Button>
                                        </div>
                                        <InputError message={errors.cadence} />
                                    </div>

                                    {cadence === 'weekdays' ? (
                                        <div className="grid gap-2">
                                            <Label>Days</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {WEEKDAYS.map((day) => (
                                                    <button
                                                        key={day.value}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleWeekday(
                                                                day.value,
                                                            )
                                                        }
                                                        className={cn(
                                                            'border-input flex size-10 items-center justify-center rounded-md border text-sm transition-colors',
                                                            weekdays.includes(
                                                                day.value,
                                                            )
                                                                ? 'bg-primary text-primary-foreground border-primary'
                                                                : 'bg-background hover:bg-muted',
                                                        )}
                                                    >
                                                        {day.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <InputError
                                                message={errors.weekdays}
                                            />
                                        </div>
                                    ) : null}

                                    {isEditing ? (
                                        <>
                                            <Separator />
                                            <div className="space-y-3">
                                                <div>
                                                    <h3 className="text-sm font-medium">
                                                        Last 12 weeks
                                                    </h3>
                                                    <p className="text-muted-foreground text-xs">
                                                        Tap a day to mark or
                                                        unmark it.
                                                    </p>
                                                </div>
                                                <div className="flex justify-center w-full">
                                                    <HabitHeatmapStrip
                                                        habitId={habit.id}
                                                        heatmap={
                                                            habit.history_heatmap
                                                        }
                                                        reloadOnly={['habits']}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </div>

                                <div className="flex shrink-0 items-center justify-between gap-2 border-t p-4">
                                    {isEditing ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() =>
                                                setConfirmDelete(true)
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                            Delete
                                        </Button>
                                    ) : (
                                        <span />
                                    )}
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                (cadence === 'weekdays' &&
                                                    weekdays.length === 0)
                                            }
                                        >
                                            {isEditing ? 'Save' : 'Create'}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Form>
                )}
            </SheetContent>
        </Sheet>
    );
}
