import { Form, router } from '@inertiajs/react';
import {
    Archive,
    Bell,
    ListChecks,
    Palette,
    Pin,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import NoteController from '@/actions/App/Http/Controllers/NoteController';
import LabelController from '@/actions/App/Http/Controllers/LabelController';
import InputError from '@/components/input-error';
import { NoteChecklistEditor } from '@/components/notes/note-checklist-editor';
import { NoteColorPicker } from '@/components/notes/note-color-picker';
import { NoteLabelPickerContent } from '@/components/notes/note-label-picker-content';
import { NoteToolbarButton } from '@/components/notes/note-toolbar-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
    formatReminder,
    toDatetimeLocalValue,
} from '@/lib/datetime-local';
import type { NoteColorId } from '@/lib/note-colors';
import { noteColorClassName } from '@/lib/note-colors';
import { itemsToDrafts, type ChecklistItemDraft } from '@/lib/note-checklist';
import { cn } from '@/lib/utils';
import type { Label as LabelType } from '@/types/label';
import type { Note } from '@/types/note';

type NoteFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    note?: Note | null;
    availableLabels?: LabelType[];
    archivedView?: boolean;
};

const fieldClassName =
    'border-0 bg-transparent px-4 shadow-none focus-visible:ring-0';

export function NoteFormDialog({
    open,
    onOpenChange,
    note = null,
    availableLabels = [],
    archivedView = false,
}: NoteFormDialogProps) {
    const isEditing = note !== null;
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [color, setColor] = useState<NoteColorId>('default');
    const [isPinned, setIsPinned] = useState(false);
    const [items, setItems] = useState<ChecklistItemDraft[]>([]);
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
        setItems(note ? itemsToDrafts(note.items) : []);
        setSelectedLabelIds(note?.labels.map((label) => label.id) ?? []);
        setNewLabelNames([]);
        setReminderAt(toDatetimeLocalValue(note?.reminder_at ?? null));
    }, [open, note]);

    const selectedLabelCount =
        selectedLabelIds.length + newLabelNames.length;
    const hasChecklist = items.length > 0;

    const enableChecklist = () => {
        if (!hasChecklist) {
            setItems([
                { text: '', is_checked: false, sort_order: 0 },
            ]);
        }
    };

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-xl sm:max-w-lg [&>button]:hidden',
                    noteColorClassName(color),
                )}
            >
                <DialogTitle className="sr-only">
                    {isEditing ? 'Edit note' : 'New note'}
                </DialogTitle>

                {isEditing && confirmDelete ? (
                    <div className="space-y-4 p-5">
                        <p className="text-sm">
                            Delete this note permanently?
                        </p>
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
                        transform={(data) => ({
                            ...data,
                            items: items.map((item, index) => ({
                                ...(item.id ? { id: item.id } : {}),
                                text: item.text,
                                is_checked: item.is_checked,
                                sort_order: index,
                            })),
                            label_ids: selectedLabelIds,
                            label_names: newLabelNames,
                            reminder_at: reminderAt || null,
                        })}
                        options={{ preserveScroll: true }}
                        onSuccess={() => onOpenChange(false)}
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="flex items-start gap-2 px-4 pt-4">
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
                                            active={isPinned}
                                            aria-label={
                                                isPinned
                                                    ? 'Unpin note'
                                                    : 'Pin note'
                                            }
                                            aria-pressed={isPinned}
                                            onClick={() =>
                                                setIsPinned((current) => !current)
                                            }
                                        >
                                            <Pin className="size-4 rotate-45" />
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

                                <input
                                    type="hidden"
                                    name="is_pinned"
                                    value={isPinned ? '1' : '0'}
                                />

                                <textarea
                                    id="note-body"
                                    name="body"
                                    defaultValue={note?.body ?? ''}
                                    placeholder="Take a note…"
                                    rows={hasChecklist ? 3 : 6}
                                    className={cn(
                                        fieldClassName,
                                        'placeholder:text-muted-foreground min-h-24 w-full resize-none py-2 text-sm outline-none',
                                    )}
                                />

                                {hasChecklist ? (
                                    <NoteChecklistEditor
                                        items={items}
                                        onChange={setItems}
                                        variant="inline"
                                    />
                                ) : null}

                                {(reminderAt || selectedLabelCount > 0) && (
                                    <div className="flex flex-wrap gap-1.5 px-4 pb-2">
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
                                    className="px-4"
                                />
                                <InputError
                                    message={errors.body}
                                    className="px-4"
                                />
                                <InputError
                                    message={errors.items}
                                    className="px-4"
                                />
                                <InputError
                                    message={errors.reminder_at}
                                    className="px-4"
                                />
                                <InputError
                                    message={errors.color}
                                    className="px-4"
                                />

                                <div className="mt-2 flex items-center gap-1 border-t border-black/5 px-2 py-2 dark:border-white/10">
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

                                    <NoteToolbarButton
                                        aria-label="Checklist"
                                        active={hasChecklist}
                                        onClick={enableChecklist}
                                    >
                                        <ListChecks className="size-4" />
                                    </NoteToolbarButton>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <NoteToolbarButton
                                                aria-label="Labels"
                                                active={
                                                    selectedLabelCount > 0
                                                }
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
                                            onClick={() =>
                                                onOpenChange(false)
                                            }
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
                            </>
                        )}
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
