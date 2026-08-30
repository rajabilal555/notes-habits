import type { NoteBlockType } from '@/lib/note-block-schema';

export type NoteBlock = {
    type: NoteBlockType | (string & {});
    props?: Record<string, unknown>;
    content?: unknown;
    children?: NoteBlock[];
};

export function blockInlineText(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }

    if (!Array.isArray(value)) {
        return '';
    }

    return value
        .map((inline) => {
            if (typeof inline === 'string') {
                return inline;
            }

            if (
                inline &&
                typeof inline === 'object' &&
                'text' in inline &&
                typeof inline.text === 'string'
            ) {
                return inline.text;
            }

            return '';
        })
        .join('');
}

export function blockChecklistProgress(content: NoteBlock[] | null | undefined): {
    checked: number;
    total: number;
} {
    if (!content?.length) {
        return { checked: 0, total: 0 };
    }

    const checklistItems: NoteBlock[] = [];

    const walk = (blocks: NoteBlock[]): void => {
        for (const block of blocks) {
            if (block.type === 'checkListItem') {
                checklistItems.push(block);
            }

            if (block.children?.length) {
                walk(block.children);
            }
        }
    };

    walk(content);

    return {
        checked: checklistItems.filter(
            (block) => block.props?.checked === true,
        ).length,
        total: checklistItems.length,
    };
}

export function hasNoteContent(content: NoteBlock[] | null | undefined): boolean {
    if (!content?.length) {
        return false;
    }

    return content.some((block) => {
        if (block.type === 'checkListItem') {
            return true;
        }

        if (blockInlineText(block.content).trim() !== '') {
            return true;
        }

        return block.children?.length
            ? hasNoteContent(block.children)
            : false;
    });
}
