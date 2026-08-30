import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { NoteCard } from '@/components/notes/note-card';
import { NoteFormDialog } from '@/components/notes/note-form-dialog';
import { Button } from '@/components/ui/button';
import { archived as notesArchived, index as notesIndex } from '@/routes/notes';
import type { Label } from '@/types/label';
import type { Note } from '@/types/note';

type NotesArchivedProps = {
    notes: Note[];
    labels: Label[];
};

export default function NotesArchived({ notes, labels }: NotesArchivedProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeNote, setActiveNote] = useState<Note | null>(null);

    const openEdit = (note: Note) => {
        setActiveNote(note);
        setDialogOpen(true);
    };

    return (
        <>
            <Head title="Archived notes" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            Archived
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Notes you've archived. Restore them anytime.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={notesIndex()}>
                            <ArrowLeft className="size-4" />
                            Back to notes
                        </Link>
                    </Button>
                </header>

                {notes.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            No archived notes.
                        </p>
                        <Button variant="outline" asChild>
                            <Link href={notesIndex()}>Back to notes</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                archived
                                onClick={() => openEdit(note)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <NoteFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                note={activeNote}
                availableLabels={labels}
                archivedView
            />
        </>
    );
}

NotesArchived.layout = {
    breadcrumbs: [
        {
            title: 'Notes',
            href: notesIndex(),
        },
        {
            title: 'Archived',
            href: notesArchived(),
        },
    ],
};
