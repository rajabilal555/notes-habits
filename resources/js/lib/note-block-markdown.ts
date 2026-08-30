import { BlockNoteEditor } from '@blocknote/core';
import {
    noteBlockSchema,
    type NoteSchemaPartialBlock,
} from '@/lib/note-block-schema';
import type { NoteBlock } from '@/lib/note-block-progress';

let previewEditor: BlockNoteEditor | null = null;

function getPreviewEditor(): BlockNoteEditor {
    previewEditor ??= BlockNoteEditor.create({
        schema: noteBlockSchema,
    }) as BlockNoteEditor;

    return previewEditor;
}

export function sanitizePreviewMarkdown(text: string): string {
    return text
        .replace(/\uFFFC/g, '')
        .replace(/\uFEFF/g, '')
        .replace(/\r\n/g, '\n')
        .trim();
}

export async function blocksToPreviewMarkdown(
    blocks: NoteBlock[] | null | undefined,
): Promise<string> {
    if (!blocks?.length || typeof document === 'undefined') {
        return '';
    }

    const markdown = sanitizePreviewMarkdown(
        await Promise.resolve(
            getPreviewEditor().blocksToMarkdownLossy(
                blocks as NoteSchemaPartialBlock[],
            ),
        ),
    );

    return markdown;
}
