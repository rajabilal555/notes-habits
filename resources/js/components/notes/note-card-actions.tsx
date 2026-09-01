import { router } from '@inertiajs/react';
import { Bell, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import NoteController from '@/actions/App/Http/Controllers/NoteController';
import { NotePinIcon } from '@/components/notes/note-pin-icon';
import { NoteToolbarButton } from '@/components/notes/note-toolbar-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { formatReminder, toDatetimeLocalValue } from '@/lib/datetime-local';
import { cn } from '@/lib/utils';
import type { Note } from '@/types/note';

type NoteCardActionsProps = {
    note: Note;
    title: string;
    className?: string;
};

export function NoteCardActions({
    note,
    title,
    className,
}: NoteCardActionsProps) {
    const [reminderOpen, setReminderOpen] = useState(false);
    const [reminderAt, setReminderAt] = useState('');

    useEffect(() => {
        if (reminderOpen) {
            setReminderAt(toDatetimeLocalValue(note.reminder_at));
        }
    }, [reminderOpen, note.reminder_at]);

    const saveReminder = (value: string) => {
        router.patch(
            NoteController.update.url(note.id),
            { reminder_at: value || null },
            { preserveScroll: true },
        );
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete "${title}" permanently?`)) {
            return;
        }

        router.delete(NoteController.destroy.url(note.id), {
            preserveScroll: true,
        });
    };

    return (
        <div
            className={cn(
                'flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100',
                note.is_pinned && 'opacity-100',
                className,
            )}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <NoteToolbarButton
                aria-label={note.is_pinned ? `Unpin ${title}` : `Pin ${title}`}
                active={note.is_pinned}
                className="size-8"
                onClick={() =>
                    router.patch(
                        NoteController.update.url(note.id),
                        { is_pinned: !note.is_pinned },
                        { preserveScroll: true },
                    )
                }
            >
                <NotePinIcon filled={note.is_pinned} />
            </NoteToolbarButton>

            <Popover open={reminderOpen} onOpenChange={setReminderOpen}>
                <PopoverTrigger asChild>
                    <NoteToolbarButton
                        aria-label={
                            note.reminder_at
                                ? `Reminder: ${formatReminder(note.reminder_at)}`
                                : 'Set reminder'
                        }
                        active={note.reminder_at !== null}
                        className="size-8"
                    >
                        <Bell className="size-4" />
                    </NoteToolbarButton>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="end">
                    <p className="mb-2 text-sm font-medium">Reminder</p>
                    <Input
                        type="datetime-local"
                        value={reminderAt}
                        onChange={(event) => {
                            const value = event.target.value;
                            setReminderAt(value);
                            saveReminder(value);
                        }}
                        className="h-9"
                    />
                    {reminderAt ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-8 px-2"
                            onClick={() => {
                                setReminderAt('');
                                saveReminder('');
                                setReminderOpen(false);
                            }}
                        >
                            Clear reminder
                        </Button>
                    ) : null}
                </PopoverContent>
            </Popover>

            <NoteToolbarButton
                aria-label={`Delete ${title}`}
                className="hover:text-destructive size-8"
                onClick={handleDelete}
            >
                <Trash2 className="size-4" />
            </NoteToolbarButton>
        </div>
    );
}
