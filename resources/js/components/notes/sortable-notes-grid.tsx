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
import { useEffect, useMemo, useState } from 'react';
import NoteController from '@/actions/App/Http/Controllers/NoteController';
import { NoteCard } from '@/components/notes/note-card';
import { NotesMasonryGrid } from '@/components/notes/notes-masonry-grid';
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

    const noteIds = useMemo(
        () => orderedNotes.map((note) => note.id),
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
            const oldIndex = current.findIndex((note) => note.id === active.id);
            const newIndex = current.findIndex((note) => note.id === over.id);
            const moved = normalizeNoteOrder(
                arrayMove(current, oldIndex, newIndex),
            );

            router.patch(
                NoteController.reorder.url(),
                { note_ids: moved.map((note) => note.id) },
                { preserveScroll: true, preserveState: true },
            );

            return moved;
        });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={noteIds} strategy={rectSortingStrategy}>
                <NotesMasonryGrid>
                    {orderedNotes.map((note) => (
                        <SortableNoteCard
                            key={note.id}
                            note={note}
                            onClick={() => onEditNote(note)}
                        />
                    ))}
                </NotesMasonryGrid>
            </SortableContext>
        </DndContext>
    );
}
