import { blockInlineText, type NoteBlock } from '@/lib/note-block-progress';
import type { Note } from '@/types/note';

export function blocksPlainText(
    blocks: NoteBlock[] | null | undefined,
): string {
    if (!blocks?.length) {
        return '';
    }

    const parts: string[] = [];

    const walk = (items: NoteBlock[]): void => {
        for (const block of items) {
            const text = blockInlineText(block.content).trim();

            if (text !== '') {
                parts.push(text);
            }

            if (block.children?.length) {
                walk(block.children);
            }
        }
    };

    walk(blocks);

    return parts.join(' ');
}

export function noteSearchText(note: Note): string {
    return [
        note.title ?? '',
        blocksPlainText(note.content),
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
