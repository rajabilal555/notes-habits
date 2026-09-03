import { addDays } from 'date-fns';
import { Clock2Icon } from 'lucide-react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import {
    combineDateAndTime,
    dateFromDatetimeLocal,
    timeFromDatetimeLocal,
} from '@/lib/datetime-local';

const DATE_PRESETS = [
    { label: 'Today', value: 0 },
    { label: 'Tomorrow', value: 1 },
    { label: 'In 3 days', value: 3 },
    { label: 'In a week', value: 7 },
    { label: 'In 2 weeks', value: 14 },
] as const;

type NoteReminderPickerProps = {
    value: string;
    onChange: (value: string) => void;
    onClear?: () => void;
};

export function NoteReminderPicker({
    value,
    onChange,
    onClear,
}: NoteReminderPickerProps) {
    const timeId = useId();
    const selectedDate = dateFromDatetimeLocal(value);
    const time = timeFromDatetimeLocal(value);
    const [currentMonth, setCurrentMonth] = useState<Date>(
        () =>
            selectedDate ??
            new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );

    const applyDate = (date: Date) => {
        onChange(combineDateAndTime(date, time));
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) {
            onChange('');
            return;
        }

        applyDate(date);
    };

    const handleTimeChange = (nextTime: string) => {
        if (!nextTime && !selectedDate) {
            onChange('');
            return;
        }

        onChange(combineDateAndTime(selectedDate, nextTime));
    };

    const handleClear = () => {
        onChange('');
        onClear?.();
    };

    return (
        <Card className="w-fit max-w-[300px] gap-0 border-0 py-0 shadow-none">
            <CardContent className="p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    fixedWeeks
                    className="bg-transparent p-0 [--cell-size:--spacing(8)]"
                />
            </CardContent>
            <CardFooter className="bg-card flex flex-wrap gap-2 border-t px-3 py-3">
                {DATE_PRESETS.map((preset) => (
                    <Button
                        key={preset.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() =>
                            applyDate(addDays(new Date(), preset.value))
                        }
                    >
                        {preset.label}
                    </Button>
                ))}
            </CardFooter>
            <CardFooter className="bg-card flex-col items-stretch gap-3 border-t px-4 py-3">
                <FieldGroup className="gap-3">
                    <Field>
                        <FieldLabel htmlFor={timeId}>Time</FieldLabel>
                        <InputGroup>
                            <InputGroupInput
                                id={timeId}
                                type="time"
                                step="60"
                                value={time}
                                onChange={(event) =>
                                    handleTimeChange(event.target.value)
                                }
                                className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                            />
                            <InputGroupAddon>
                                <Clock2Icon className="text-muted-foreground" />
                            </InputGroupAddon>
                        </InputGroup>
                    </Field>
                </FieldGroup>
                {value ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="justify-start px-2"
                        onClick={handleClear}
                    >
                        Clear reminder
                    </Button>
                ) : null}
            </CardFooter>
        </Card>
    );
}
