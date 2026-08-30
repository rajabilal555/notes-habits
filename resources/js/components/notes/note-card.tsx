import { router } from '@inertiajs/react';
import { ArchiveRestore, GripVertical, Pin } from 'lucide-react';
import type { DraggableAttributes } from '@dnd-kit/core';
import NoteController from '@/actions/App/Http/Controllers/NoteController';
import NoteItemController from '@/actions/App/Http/Controllers/NoteItemController';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { noteColorClassName } from '@/lib/note-colors';
import { checklistProgress } from '@/lib/note-checklist';
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
    const preview = note.body?.trim() || '';
    const title = note.title?.trim() || 'Untitled';
    const { checked, total } = checklistProgress(note.items);
    const hasItems = total > 0;

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
                'border-sidebar-border/70 dark:border-sidebar-border flex min-h-32 cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left transition-colors',
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
                    {note.is_pinned ? (
                        <Pin
                            className="text-muted-foreground size-4 rotate-45"
                            aria-label="Pinned"
                        />
                    ) : null}
                </div>
            </div>

            {hasItems ? (
                <ul className="space-y-1.5">
                    {note.items.slice(0, 5).map((item) => (
                        <li
                            key={item.id}
                            className="flex items-start gap-2 text-sm"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <Checkbox
                                checked={item.is_checked}
                                onCheckedChange={() =>
                                    router.patch(
                                        NoteItemController.update.url([
                                            note.id,
                                            item.id,
                                        ]),
                                        { is_checked: !item.is_checked },
                                        { preserveScroll: true },
                                    )
                                }
                                className="mt-0.5"
                                aria-label={`Toggle ${item.text}`}
                            />
                            <span
                                className={cn(
                                    'line-clamp-2 flex-1',
                                    item.is_checked &&
                                        'text-muted-foreground line-through',
                                )}
                            >
                                {item.text}
                            </span>
                        </li>
                    ))}
                    {total > 5 ? (
                        <li className="text-muted-foreground text-xs">
                            +{total - 5} more
                        </li>
                    ) : null}
                </ul>
            ) : null}

            {preview ? (
                <p
                    className={cn(
                        'text-muted-foreground line-clamp-4 text-sm whitespace-pre-wrap',
                        !note.title?.trim() &&
                            !hasItems &&
                            'text-foreground line-clamp-8',
                    )}
                >
                    {preview}
                </p>
            ) : !hasItems ? (
                <p className="text-muted-foreground text-sm italic">
                    Empty note
                </p>
            ) : null}

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

            <span className="sr-only">Edit {title}</span>
        </div>
    );
}
