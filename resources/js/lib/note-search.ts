import { isLegacyContent, type NoteContent } from '@/lib/note-content';
import type { Note } from '@/types/note';

export function contentPlainText(
    content: NoteContent | null | undefined,
): string {
    if (!content?.trim()) {
        return '';
    }

    if (isLegacyContent(content)) {
        return content;
    }

    return content
        .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/[#*_`[\]()]/g, '')
        .trim();
}

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
