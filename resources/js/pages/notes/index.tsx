import { Head, Link, router } from '@inertiajs/react';
import { Archive, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { CommandMenuTrigger } from '@/components/command-menu-trigger';
import { NoteCard } from '@/components/notes/note-card';
import { NoteFormDialog } from '@/components/notes/note-form-dialog';
import { SortableNotesGrid } from '@/components/notes/sortable-notes-grid';
import { NotesMasonryGrid } from '@/components/notes/notes-masonry-grid';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    useRegisterCommandActions,
    type CommandMenuAction,
} from '@/hooks/use-command-menu';
import { archived as notesArchived, index as notesIndex } from '@/routes/notes';
import type { Label } from '@/types/label';
import type { Note } from '@/types/note';

type NotesIndexProps = {
    notes: Note[];
    labels: Label[];
    selectedLabelId: number | null;
};

export default function NotesIndex({
    notes,
    labels,
    selectedLabelId,
}: NotesIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeNote, setActiveNote] = useState<Note | null>(null);

    const openCreate = useCallback(() => {
        setActiveNote(null);
        setDialogOpen(true);
    }, []);

    const openEdit = (note: Note) => {
        setActiveNote(note);
        setDialogOpen(true);
    };

    const commandActions = useMemo<CommandMenuAction[]>(
        () => [
            {
                id: 'new-note',
                label: 'New note',
                icon: Plus,
                shortcut: 'N',
                keywords: ['create', 'add'],
                onSelect: openCreate,
            },
            {
                id: 'archived-notes',
                label: 'Archived notes',
                icon: Archive,
                keywords: ['archive'],
                onSelect: () => router.visit(notesArchived()),
            },
        ],
        [openCreate],
    );

    useRegisterCommandActions(commandActions);

    const filterByLabel = (labelId: string) => {
        router.get(
            notesIndex.url(
                labelId === 'all' ? undefined : { query: { label: labelId } },
            ),
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Notes" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <header className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">
                                Notes
                            </h1>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Capture ideas, checklists, and reminders.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {labels.length > 0 ? (
                                <Select
                                    value={
                                        selectedLabelId
                                            ? String(selectedLabelId)
                                            : 'all'
                                    }
                                    onValueChange={filterByLabel}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All labels" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All labels
                                        </SelectItem>
                                        {labels.map((label) => (
                                            <SelectItem
                                                key={label.id}
                                                value={String(label.id)}
                                            >
                                                {label.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : null}
                            <Button variant="outline" asChild>
                                <Link href={notesArchived()}>
                                    <Archive className="size-4" />
                                    Archived
                                </Link>
                            </Button>
                            <Button onClick={openCreate}>
                                <Plus className="size-4" />
                                New note
                            </Button>
                        </div>
                    </div>
                    <CommandMenuTrigger className="sm:max-w-md" />
                    {selectedLabelId && notes.length > 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Clear the label filter to rearrange notes.
                        </p>
                    ) : null}
                </header>

                {notes.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            No notes yet. Create one to get started.
                        </p>
                        <Button variant="outline" onClick={openCreate}>
                            <Plus className="size-4" />
                            New note
                        </Button>
                    </div>
                ) : selectedLabelId ? (
                    <NotesMasonryGrid>
                        {notes.map((note) => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onClick={() => openEdit(note)}
                            />
                        ))}
                    </NotesMasonryGrid>
                ) : (
                    <SortableNotesGrid notes={notes} onEditNote={openEdit} />
                )}
            </div>

            <NoteFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                note={activeNote}
                availableLabels={labels}
            />
        </>
    );
}

NotesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Notes',
            href: notesIndex(),
        },
    ],
};
