import { Form, router } from '@inertiajs/react';
import { Pin } from 'lucide-react';
import { useEffect, useState } from 'react';
import NoteController from '@/actions/App/Http/Controllers/NoteController';
import InputError from '@/components/input-error';
import { NoteChecklistEditor } from '@/components/notes/note-checklist-editor';
import { NoteColorPicker } from '@/components/notes/note-color-picker';
import { NoteLabelPicker } from '@/components/notes/note-label-picker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toDatetimeLocalValue } from '@/lib/datetime-local';
import type { NoteColorId } from '@/lib/note-colors';
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit note' : 'New note'}
                    </DialogTitle>
                </DialogHeader>

                {isEditing && confirmDelete ? (
                    <Form
                        {...NoteController.destroy.form(note.id)}
                        options={{ preserveScroll: true }}
                        onSuccess={() => onOpenChange(false)}
                        className="space-y-4"
                    >
                        {({ processing }) => (
                            <>
                                <p className="text-muted-foreground text-sm">
                                    Delete this note permanently?
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
                        className="space-y-4"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label>Color</Label>
                                    <NoteColorPicker
                                        value={color}
                                        onChange={setColor}
                                    />
                                    <InputError message={errors.color} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="note-title">Title</Label>
                                    <Input
                                        id="note-title"
                                        name="title"
                                        defaultValue={note?.title ?? ''}
                                        placeholder="Title"
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="note-body">Note</Label>
                                    <textarea
                                        id="note-body"
                                        name="body"
                                        defaultValue={note?.body ?? ''}
                                        placeholder="Take a note…"
                                        rows={6}
                                        className={cn(
                                            'border-input placeholder:text-muted-foreground flex w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm',
                                            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                        )}
                                    />
                                    <InputError message={errors.body} />
                                </div>

                                <NoteChecklistEditor
                                    items={items}
                                    onChange={setItems}
                                />
                                <InputError message={errors.items} />

                                <NoteLabelPicker
                                    availableLabels={availableLabels}
                                    selectedIds={selectedLabelIds}
                                    newNames={newLabelNames}
                                    onSelectedIdsChange={setSelectedLabelIds}
                                    onNewNamesChange={setNewLabelNames}
                                />

                                <div className="grid gap-2">
                                    <Label htmlFor="note-reminder">Reminder</Label>
                                    <Input
                                        id="note-reminder"
                                        type="datetime-local"
                                        value={reminderAt}
                                        onChange={(event) =>
                                            setReminderAt(event.target.value)
                                        }
                                    />
                                    <InputError message={errors.reminder_at} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="note-pinned"
                                        checked={isPinned}
                                        onCheckedChange={(checked) =>
                                            setIsPinned(checked === true)
                                        }
                                    />
                                    <input
                                        type="hidden"
                                        name="is_pinned"
                                        value={isPinned ? '1' : '0'}
                                    />
                                    <Label
                                        htmlFor="note-pinned"
                                        className="flex items-center gap-1.5 font-normal"
                                    >
                                        <Pin className="size-4 rotate-45" />
                                        Pin to top
                                    </Label>
                                </div>

                                <DialogFooter className="flex-col gap-3 sm:flex-col sm:items-stretch">
                                    {isEditing ? (
                                        <div className="flex flex-wrap gap-2">
                                            {archivedView ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
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
                                                    Restore to notes
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
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
                                                    Archive
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() =>
                                                    setConfirmDelete(true)
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </div>
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
                                            disabled={processing}
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
