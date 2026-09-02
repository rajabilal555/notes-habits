import { contentPlainText } from '@/lib/note-content';
import type { Note } from '@/types/note';

export function noteSearchText(note: Note): string {
    return [
        note.title ?? '',
        contentPlainText(note.content),
        ...note.labels.map((label) => label.name),
    ]
        .join(' ')
        .toLowerCase();
}

export function filterNotesByQuery(notes: Note[], query: string): Note[] {
    const normalized = query.trim().toLowerCase();

    if (normalized === '') {
        return notes;
    }

    return notes.filter((note) => noteSearchText(note).includes(normalized));
}
