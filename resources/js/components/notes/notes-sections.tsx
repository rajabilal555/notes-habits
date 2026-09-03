import type { ReactNode } from 'react';
import { NotesMasonryGrid } from '@/components/notes/notes-masonry-grid';
import type { Note } from '@/types/note';

export function splitPinnedNotes(notes: Note[]): {
    pinned: Note[];
    unpinned: Note[];
} {
    return {
        pinned: notes.filter((note) => note.is_pinned),
        unpinned: notes.filter((note) => !note.is_pinned),
    };
}

function NotesSection({
    title,
    children,
}: {
    title?: string;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-3">
            {title ? (
                <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    {title}
                </h2>
            ) : null}
            <NotesMasonryGrid>{children}</NotesMasonryGrid>
        </section>
    );
}

export function NotesSections({
    notes,
    renderNote,
}: {
    notes: Note[];
    renderNote: (note: Note) => ReactNode;
}) {
    const { pinned, unpinned } = splitPinnedNotes(notes);

    return (
        <div className="flex flex-col gap-8">
            {pinned.length > 0 ? (
                <NotesSection title="Pinned">
                    {pinned.map((note) => (
                        <div key={note.id}>{renderNote(note)}</div>
                    ))}
                </NotesSection>
            ) : null}
            {unpinned.length > 0 ? (
                <NotesSection title={pinned.length > 0 ? 'Others' : undefined}>
                    {unpinned.map((note) => (
                        <div key={note.id}>{renderNote(note)}</div>
                    ))}
                </NotesSection>
            ) : null}
        </div>
    );
}
