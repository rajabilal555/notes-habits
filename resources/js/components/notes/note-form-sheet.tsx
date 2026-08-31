import type { FormDataConvertible } from '@inertiajs/core';
import { Form, router } from '@inertiajs/react';
import { Archive, Bell, Palette, Tag, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import NoteController from '@/actions/App/Http/Controllers/NoteController';
import LabelController from '@/actions/App/Http/Controllers/LabelController';
import InputError from '@/components/input-error';
import { NoteEditor } from '@/components/notes/note-editor';
import { NoteColorPicker } from '@/components/notes/note-color-picker';
import { NoteLabelPickerContent } from '@/components/notes/note-label-picker-content';
import { NotePinIcon } from '@/components/notes/note-pin-icon';
import { NoteToolbarButton } from '@/components/notes/note-toolbar-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { formatReminder, toDatetimeLocalValue } from '@/lib/datetime-local';
import type { NoteContent } from '@/lib/note-content';
import type { NoteColorId } from '@/lib/note-colors';
import { noteColorClassName } from '@/lib/note-colors';
import { cn } from '@/lib/utils';
import type { Label as LabelType } from '@/types/label';
import type { Note } from '@/types/note';

type NoteFormSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    note?: Note | null;
    availableLabels?: LabelType[];
    archivedView?: boolean;
};

const fieldClassName =
    'border-0 bg-transparent px-4 shadow-none focus-visible:ring-0';

export function NoteFormSheet({
    open,
    onOpenChange,
    note = null,
    availableLabels = [],
    archivedView = false,
}: NoteFormSheetProps) {
    const isEditing = note !== null;
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [color, setColor] = useState<NoteColorId>('default');
    const [isPinned, setIsPinned] = useState(false);
    const [content, setContent] = useState<NoteContent | null>(null);
    const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([]);
    const [newLabelNames, setNewLabelNames] = useState<string[]>([]);
    const [reminderAt, setReminderAt] = useState('');

    useEffect(() => {
        if (!open) {
            setConfirmDelete(false);
            return;
        }

        setColor(note?.color ?? 'default');
        setIsPinned(note?.is_pinned ?? false);
        setContent(note?.content ?? null);
        setSelectedLabelIds(note?.labels.map((label) => label.id) ?? []);
        setNewLabelNames([]);
        setReminderAt(toDatetimeLocalValue(note?.reminder_at ?? null));
    }, [open, note]);

    const selectedLabelCount = selectedLabelIds.length + newLabelNames.length;
    const editorKey = `${note?.id ?? 'new'}-${open ? 'open' : 'closed'}`;

    const deleteLabel = (label: LabelType) => {
        if (
            !window.confirm(
                `Delete "${label.name}"? It will be removed from all notes.`,
            )
        ) {
            return;
        }

        router.delete(LabelController.destroy.url(label.id), {
            preserveScroll: true,
            only: ['labels', 'notes'],
            onSuccess: () => {
                setSelectedLabelIds((current) =>
                    current.filter((id) => id !== label.id),
                );
            },
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className={cn(
                    'flex h-full w-full flex-col gap-0 border-0 p-0 sm:max-w-xl md:max-w-2xl [&>button]:hidden',
                    noteColorClassName(color),
                )}
            >
                <SheetTitle className="sr-only">
                    {isEditing ? 'Edit note' : 'New note'}
                </SheetTitle>

                {isEditing && confirmDelete ? (
                    <div className="space-y-4 p-5">
                        <p className="text-sm">Delete this note permanently?</p>
                        <Form
                            {...NoteController.destroy.form(note.id)}
                            options={{ preserveScroll: true }}
                            onSuccess={() => onOpenChange(false)}
                        >
                            {({ processing }) => (
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
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
                            ? NoteController.update.form(note.id)
                            : NoteController.store.form())}
                        transform={(data) =>
                            ({
                                ...data,
                                content: content ?? null,
                                color,
                                is_pinned: isPinned,
                                label_ids: selectedLabelIds,
                                label_names: newLabelNames,
                                reminder_at: reminderAt || null,
                            }) as Record<string, FormDataConvertible>
                        }
                        options={{ preserveScroll: true }}
                        onSuccess={() => onOpenChange(false)}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        {({ processing, errors }) => (
                            <div className="note-editor-shell relative flex min-h-0 flex-1 flex-col">
                                <div className="relative z-10 flex shrink-0 items-start gap-2 px-4 pt-4">
                                    <Input
                                        id="note-title"
                                        name="title"
                                        defaultValue={note?.title ?? ''}
                                        placeholder="Title"
                                        className={cn(
                                            fieldClassName,
                                            'flex-1 text-base font-semibold',
                                        )}
                                    />
                                    <div className="flex shrink-0 items-center gap-0.5">
                                        <NoteToolbarButton
                                            type="button"
                                            aria-label={
                                                isPinned
                                                    ? 'Unpin note'
                                                    : 'Pin note'
                                            }
                                            aria-pressed={isPinned}
                                            onClick={() =>
                                                setIsPinned(
                                                    (current) => !current,
                                                )
                                            }
                                        >
                                            <NotePinIcon
                                                filled={isPinned}
                                                className={
                                                    isPinned
                                                        ? 'text-foreground'
                                                        : undefined
                                                }
                                            />
                                        </NoteToolbarButton>
                                        <NoteToolbarButton
                                            type="button"
                                            aria-label="Close"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            <X className="size-4" />
                                        </NoteToolbarButton>
                                    </div>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    <NoteEditor
                                        key={editorKey}
                                        content={content}
                                        onChange={setContent}
                                        className="note-editor--sheet"
                                    />
                                </div>

                                {(reminderAt || selectedLabelCount > 0) && (
                                    <div className="flex shrink-0 flex-wrap gap-1.5 px-4 pb-2">
                                        {reminderAt ? (
                                            <Badge
                                                variant="secondary"
                                                className="gap-1 text-xs"
                                            >
                                                <Bell className="size-3" />
                                                {formatReminder(
                                                    new Date(
                                                        reminderAt,
                                                    ).toISOString(),
                                                )}
                                            </Badge>
                                        ) : null}
                                        {availableLabels
                                            .filter((label) =>
                                                selectedLabelIds.includes(
                                                    label.id,
                                                ),
                                            )
                                            .map((label) => (
                                                <Badge
                                                    key={label.id}
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    {label.name}
                                                </Badge>
                                            ))}
                                        {newLabelNames.map((name) => (
                                            <Badge
                                                key={name}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {name}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                <InputError
                                    message={errors.title}
                                    className="shrink-0 px-4"
                                />
                                <InputError
                                    message={errors.content}
                                    className="shrink-0 px-4"
                                />
                                <InputError
                                    message={errors.reminder_at}
                                    className="shrink-0 px-4"
                                />
                                <InputError
                                    message={errors.color}
                                    className="shrink-0 px-4"
                                />

                                <div className="mt-auto flex shrink-0 items-center gap-1 border-t border-black/5 px-2 py-2 dark:border-white/10">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <NoteToolbarButton
                                                aria-label="Background color"
                                                active={color !== 'default'}
                                            >
                                                <Palette className="size-4" />
                                            </NoteToolbarButton>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto">
                                            <p className="mb-2 text-sm font-medium">
                                                Color
                                            </p>
                                            <NoteColorPicker
                                                value={color}
                                                onChange={setColor}
                                                name="color"
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <NoteToolbarButton
                                                aria-label="Labels"
                                                active={selectedLabelCount > 0}
                                            >
                                                <Tag className="size-4" />
                                            </NoteToolbarButton>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64">
                                            <NoteLabelPickerContent
                                                availableLabels={
                                                    availableLabels
                                                }
                                                attachedLabels={
                                                    note?.labels ?? []
                                                }
                                                selectedIds={selectedLabelIds}
                                                newNames={newLabelNames}
                                                onSelectedIdsChange={
                                                    setSelectedLabelIds
                                                }
                                                onNewNamesChange={
                                                    setNewLabelNames
                                                }
                                                onDeleteLabel={deleteLabel}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <NoteToolbarButton
                                                aria-label="Reminder"
                                                active={reminderAt !== ''}
                                            >
                                                <Bell className="size-4" />
                                            </NoteToolbarButton>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64">
                                            <p className="mb-2 text-sm font-medium">
                                                Reminder
                                            </p>
                                            <Input
                                                id="note-reminder"
                                                type="datetime-local"
                                                value={reminderAt}
                                                onChange={(event) =>
                                                    setReminderAt(
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-9"
                                            />
                                            {reminderAt ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2 h-8 px-2"
                                                    onClick={() =>
                                                        setReminderAt('')
                                                    }
                                                >
                                                    Clear reminder
                                                </Button>
                                            ) : null}
                                        </PopoverContent>
                                    </Popover>

                                    {isEditing ? (
                                        <>
                                            <Separator
                                                orientation="vertical"
                                                className="mx-1 h-6"
                                            />
                                            {archivedView ? (
                                                <NoteToolbarButton
                                                    aria-label="Restore note"
                                                    onClick={() =>
                                                        router.patch(
                                                            NoteController.unarchive.url(
                                                                note.id,
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess: () =>
                                                                    onOpenChange(
                                                                        false,
                                                                    ),
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Archive className="size-4" />
                                                </NoteToolbarButton>
                                            ) : (
                                                <NoteToolbarButton
                                                    aria-label="Archive note"
                                                    onClick={() =>
                                                        router.patch(
                                                            NoteController.archive.url(
                                                                note.id,
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                                onSuccess: () =>
                                                                    onOpenChange(
                                                                        false,
                                                                    ),
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Archive className="size-4" />
                                                </NoteToolbarButton>
                                            )}
                                            <NoteToolbarButton
                                                aria-label="Delete note"
                                                onClick={() =>
                                                    setConfirmDelete(true)
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </NoteToolbarButton>
                                        </>
                                    ) : null}

                                    <div className="ml-auto flex items-center gap-2 pr-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            disabled={processing}
                                            className="rounded-full px-5"
                                        >
                                            {isEditing ? 'Save' : 'Create'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Form>
                )}
            </SheetContent>
        </Sheet>
    );
}
