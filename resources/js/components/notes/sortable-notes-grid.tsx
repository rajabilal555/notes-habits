import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import NoteController from '@/actions/App/Http/Controllers/NoteController';
import { NoteCard } from '@/components/notes/note-card';
import { NotesMasonryGrid } from '@/components/notes/notes-masonry-grid';
import { splitPinnedNotes } from '@/components/notes/notes-sections';
import { normalizeNoteOrder } from '@/lib/note-order';
import type { Note } from '@/types/note';

function SortableNoteCard({
    note,
    onClick,
}: {
    note: Note;
    onClick: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: note.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={isDragging ? 'z-10 opacity-60' : undefined}
        >
            <NoteCard
                note={note}
                onClick={onClick}
                dragHandleRef={setActivatorNodeRef}
                dragHandleListeners={listeners}
                dragHandleAttributes={attributes}
            />
        </div>
    );
}

function SortableNotesSection({
    title,
    notes,
    onEditNote,
}: {
    title?: string;
    notes: Note[];
    onEditNote: (note: Note) => void;
}) {
    const noteIds = useMemo(() => notes.map((note) => note.id), [notes]);

    return (
        <section className="flex flex-col gap-3">
            {title ? (
                <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {title}
                </h2>
            ) : null}
            <SortableContext items={noteIds} strategy={rectSortingStrategy}>
                <NotesMasonryGrid>
                    {notes.map((note) => (
                        <SortableNoteCard
                            key={note.id}
                            note={note}
                            onClick={() => onEditNote(note)}
                        />
                    ))}
                </NotesMasonryGrid>
            </SortableContext>
        </section>
    );
}

export function SortableNotesGrid({
    notes,
    onEditNote,
}: {
    notes: Note[];
    onEditNote: (note: Note) => void;
}) {
    const [orderedNotes, setOrderedNotes] = useState(notes);

    useEffect(() => {
        setOrderedNotes(notes);
    }, [notes]);

    const { pinned, unpinned } = useMemo(
        () => splitPinnedNotes(orderedNotes),
        [orderedNotes],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setOrderedNotes((current) => {
            const activeNote = current.find((note) => note.id === active.id);
            const overNote = current.find((note) => note.id === over.id);

            if (!activeNote || !overNote) {
                return current;
            }

            if (activeNote.is_pinned !== overNote.is_pinned) {
                return current;
            }

            const group = current.filter(
                (note) => note.is_pinned === activeNote.is_pinned,
            );
            const other = current.filter(
                (note) => note.is_pinned !== activeNote.is_pinned,
            );
            const oldIndex = group.findIndex((note) => note.id === active.id);
            const newIndex = group.findIndex((note) => note.id === over.id);
            const reorderedGroup = arrayMove(group, oldIndex, newIndex);
            const moved = normalizeNoteOrder(
                activeNote.is_pinned
                    ? [...reorderedGroup, ...other]
                    : [...other, ...reorderedGroup],
            );

            router.patch(
                NoteController.reorder.url(),
                { note_ids: moved.map((note) => note.id) },
                { preserveScroll: true, preserveState: true },
            );

            return moved;
        });
    };

    let content: ReactNode = null;

    if (pinned.length > 0 || unpinned.length > 0) {
        content = (
            <div className="flex flex-col gap-8">
                {pinned.length > 0 ? (
                    <SortableNotesSection
                        title="Pinned"
                        notes={pinned}
                        onEditNote={onEditNote}
                    />
                ) : null}
                {unpinned.length > 0 ? (
                    <SortableNotesSection
                        title={pinned.length > 0 ? 'Others' : undefined}
                        notes={unpinned}
                        onEditNote={onEditNote}
                    />
                ) : null}
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            {content}
        </DndContext>
    );
}
