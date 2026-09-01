import { router } from '@inertiajs/react';
import { ArchiveRestore, Bell, GripVertical } from 'lucide-react';
import type { DraggableAttributes } from '@dnd-kit/core';
import NoteController from '@/actions/App/Http/Controllers/NoteController';
import { NoteCardActions } from '@/components/notes/note-card-actions';
import { NoteContentPreview } from '@/components/notes/note-content-preview';
import { Badge } from '@/components/ui/badge';
import { formatReminder } from '@/lib/datetime-local';
import { noteColorClassName } from '@/lib/note-colors';
import { blockChecklistProgress, hasNoteContent } from '@/lib/note-content';
import { cn } from '@/lib/utils';
import type { Note } from '@/types/note';

export function NoteCard({
    note,
    onClick,
    archived = false,
    dragHandleRef,
    dragHandleProps,
}: {
    note: Note;
    onClick: () => void;
    archived?: boolean;
    dragHandleRef?: (element: HTMLElement | null) => void;
    dragHandleProps?: DraggableAttributes & Record<string, unknown>;
}) {
    const title = note.title?.trim() || 'Untitled';
    const { checked, total } = blockChecklistProgress(note.content);
    const hasItems = total > 0;
    const showContent = hasNoteContent(note.content);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick();
                }
            }}
            className={cn(
                'group border-sidebar-border/70 dark:border-sidebar-border relative flex min-h-40 cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left transition-colors',
                noteColorClassName(note.color),
                'focus-visible:ring-ring hover:brightness-[0.98] focus-visible:ring-2 focus-visible:outline-none dark:hover:brightness-110',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-start gap-1">
                    {dragHandleProps ? (
                        <button
                            type="button"
                            ref={dragHandleRef}
                            className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 cursor-grab touch-none active:cursor-grabbing"
                            aria-label={`Drag ${title}`}
                            onClick={(event) => event.stopPropagation()}
                            {...dragHandleProps}
                        >
                            <GripVertical className="size-4" />
                        </button>
                    ) : null}
                    {note.title?.trim() ? (
                        <h2 className="line-clamp-2 flex-1 font-medium">
                            {note.title}
                        </h2>
                    ) : (
                        <span className="flex-1" />
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {hasItems ? (
                        <span className="text-muted-foreground text-xs">
                            {checked}/{total}
                        </span>
                    ) : null}
                    {note.reminder_at ? (
                        <span
                            className="text-muted-foreground flex items-center gap-1 text-xs"
                            title={formatReminder(note.reminder_at)}
                        >
                            <Bell className="size-3.5 shrink-0" />
                            <span className="max-w-24 truncate">
                                {formatReminder(note.reminder_at)}
                            </span>
                        </span>
                    ) : null}
                    {archived ? (
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
                            aria-label={`Restore ${title} to notes`}
                            onClick={(event) => {
                                event.stopPropagation();
                                router.patch(
                                    NoteController.unarchive.url(note.id),
                                    {},
                                    { preserveScroll: true },
                                );
                            }}
                        >
                            <ArchiveRestore className="size-4" />
                        </button>
                    ) : null}
                </div>
            </div>

            {showContent ? (
                <NoteContentPreview
                    content={note.content}
                    className="max-h-52 overflow-hidden"
                />
            ) : (
                <p className="text-muted-foreground text-sm italic">
                    Empty note
                </p>
            )}

            {note.labels.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                    {note.labels.map((label) => (
                        <Badge
                            key={label.id}
                            variant="secondary"
                            className="text-xs"
                        >
                            {label.name}
                        </Badge>
                    ))}
                </div>
            ) : null}

            <NoteCardActions
                note={note}
                title={title}
                className="mt-auto justify-end pt-1"
            />

            <span className="sr-only">Edit {title}</span>
        </div>
    );
}
