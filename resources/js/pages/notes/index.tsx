import { Head, Link, router } from '@inertiajs/react';
import { Archive, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { NoteCard } from '@/components/notes/note-card';
import { NoteFormSheet } from '@/components/notes/note-form-sheet';
import { NotesSearchInput } from '@/components/notes/notes-search-input';
import { SortableNotesGrid } from '@/components/notes/sortable-notes-grid';
import { NotesSections } from '@/components/notes/notes-sections';
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
import { filterNotesByQuery } from '@/lib/note-search';
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
    const [sheetOpen, setSheetOpen] = useState(false);
    const [activeNote, setActiveNote] = useState<Note | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = useMemo(
        () => filterNotesByQuery(notes, searchQuery),
        [notes, searchQuery],
    );
    const isSearching = searchQuery.trim() !== '';
    const canReorder = !selectedLabelId && !isSearching;

    const openCreate = useCallback(() => {
        setActiveNote(null);
        setSheetOpen(true);
    }, []);

    const openEdit = (note: Note) => {
        setActiveNote(note);
        setSheetOpen(true);
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
                    <NotesSearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                    {selectedLabelId && notes.length > 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Clear the label filter to rearrange notes.
                        </p>
                    ) : isSearching && notes.length > 0 ? (
                        <p className="text-muted-foreground text-sm">
                            Clear search to rearrange notes.
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
                ) : filteredNotes.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
                        <p className="text-muted-foreground text-sm">
                            No notes match &ldquo;{searchQuery.trim()}&rdquo;.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setSearchQuery('')}
                        >
                            Clear search
                        </Button>
                    </div>
                ) : canReorder ? (
                    <SortableNotesGrid
                        notes={filteredNotes}
                        onEditNote={openEdit}
                    />
                ) : (
                    <NotesSections
                        notes={filteredNotes}
                        renderNote={(note) => (
                            <NoteCard
                                note={note}
                                onClick={() => openEdit(note)}
                            />
                        )}
                    />
                )}
            </div>

            <NoteFormSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
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
