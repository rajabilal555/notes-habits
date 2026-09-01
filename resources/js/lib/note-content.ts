import type { JSONContent } from '@tiptap/core';

export type NoteContent = JSONContent;

export function emptyNoteContent(): NoteContent {
    return {
        type: 'doc',
        content: [
            {
                type: 'paragraph',
            },
        ],
    };
}

export function normalizeNoteContent(
    content: NoteContent | null | undefined,
): NoteContent {
    if (!content || content.type !== 'doc') {
        return emptyNoteContent();
    }

    return {
        type: 'doc',
        content: Array.isArray(content.content) ? content.content : [],
    };
}

export function nodePlainText(node: unknown): string {
    if (typeof node === 'string') {
        return node;
    }

    if (!node || typeof node !== 'object') {
        return '';
    }

    if ('text' in node && typeof node.text === 'string') {
        return node.text;
    }

    if ('content' in node && Array.isArray(node.content)) {
        return node.content.map(nodePlainText).join('');
    }

    return '';
}

export function hasNoteContent(
    content: NoteContent | null | undefined,
): boolean {
    if (!content) {
        return false;
    }

    const text = nodePlainText(content).trim();

    if (text !== '') {
        return true;
    }

    const walk = (nodes: unknown[]): boolean => {
        for (const node of nodes) {
            if (!node || typeof node !== 'object') {
                continue;
            }

            if ('type' in node && node.type === 'horizontalRule') {
                return true;
            }

            if ('type' in node && node.type === 'image') {
                return true;
            }

            if (
                'content' in node &&
                Array.isArray(node.content) &&
                walk(node.content)
            ) {
                return true;
            }
        }

        return false;
    };

    return Array.isArray(content.content) ? walk(content.content) : false;
}

export function blockChecklistProgress(
    content: NoteContent | null | undefined,
): {
    checked: number;
    total: number;
} {
    if (!content?.content?.length) {
        return { checked: 0, total: 0 };
    }

    const checklistItems: Array<{ attrs?: { checked?: boolean } }> = [];

    const walk = (nodes: unknown[]): void => {
        for (const node of nodes) {
            if (!node || typeof node !== 'object') {
                continue;
            }

            if ('type' in node && node.type === 'taskItem') {
                checklistItems.push(node as { attrs?: { checked?: boolean } });
            }

            if ('content' in node && Array.isArray(node.content)) {
                walk(node.content);
            }
        }
    };

    walk(content.content);

    return {
        checked: checklistItems.filter((item) => item.attrs?.checked === true)
            .length,
        total: checklistItems.length,
    };
}
