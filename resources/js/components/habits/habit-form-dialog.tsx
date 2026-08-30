import { Form } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import HabitController from '@/actions/App/Http/Controllers/HabitController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type HabitFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    habit?: Habit | null;
};

export function HabitFormDialog({
    open,
    onOpenChange,
    habit = null,
}: HabitFormDialogProps) {
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit habit' : 'New habit'}
                    </DialogTitle>
                </DialogHeader>

                {isEditing && confirmDelete ? (
                    <Form
                        {...HabitController.destroy.form(habit.id)}
                        options={{ preserveScroll: true }}
                        onSuccess={() => onOpenChange(false)}
                        className="space-y-4"
                    >
                        {({ processing }) => (
                            <>
                                <p className="text-muted-foreground text-sm">
                                    Delete this habit and its completion history?
                                </p>
                                <DialogFooter className="gap-2 sm:justify-between">
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
                                </DialogFooter>
                            </>
                        )}
                    </Form>
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
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="habit-name">Name</Label>
                                    <Input
                                        id="habit-name"
                                        name="name"
                                        defaultValue={habit?.name ?? ''}
                                        placeholder="Morning run"
                                    />
                                    <InputError message={errors.name} />
                                </div>

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
                                            onClick={() => setCadence('daily')}
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
                                                        toggleWeekday(day.value)
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
                                        <InputError message={errors.weekdays} />
                                    </div>
                                ) : null}

                                <DialogFooter className="flex-col gap-3 sm:flex-col sm:items-stretch">
                                    {isEditing ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive self-start"
                                            onClick={() =>
                                                setConfirmDelete(true)
                                            }
                                        >
                                            Delete
                                        </Button>
                                    ) : null}

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                onOpenChange(false)
                                            }
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
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
