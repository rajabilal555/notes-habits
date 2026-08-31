import { nodePlainText, type NoteContent } from '@/lib/note-content';
import type { Note } from '@/types/note';

export function contentPlainText(
    content: NoteContent | null | undefined,
): string {
    if (!content) {
        return '';
    }

    const nodes =
        content.type === 'doc' && Array.isArray(content.content)
            ? content.content
            : [content];

    const parts: string[] = [];

    const walk = (items: unknown[]): void => {
        for (const node of items) {
            const text = nodePlainText(node).trim();

            if (text !== '') {
                parts.push(text);
            }

            if (
                node &&
                typeof node === 'object' &&
                'content' in node &&
                Array.isArray(node.content)
            ) {
                walk(node.content);
            }
        }
    };

    walk(nodes);

    return parts.join(' ');
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
