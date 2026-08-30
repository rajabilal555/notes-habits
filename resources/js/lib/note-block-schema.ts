import type { PortalElementsMap } from '@blocknote/react';
import {
    BlockNoteSchema,
    createHeadingBlockSpec,
    defaultBlockSpecs,
} from '@blocknote/core';

/**
 * Block types available in the notes editor.
 * Media blocks (image/audio/video/file) and toggles are excluded — they need
 * upload plumbing or add nesting complexity we do not support yet.
 */
export const NOTE_BLOCK_TYPES = [
    'paragraph',
    'heading',
    'bulletListItem',
    'numberedListItem',
    'checkListItem',
    'table',
    'quote',
    'divider',
    'codeBlock',
] as const;

export type NoteBlockType = (typeof NOTE_BLOCK_TYPES)[number];

export const noteBlockSchema = BlockNoteSchema.create({
    blockSpecs: {
        paragraph: defaultBlockSpecs.paragraph,
        heading: createHeadingBlockSpec({
            levels: [1, 2, 3],
            allowToggleHeadings: false,
        }),
        bulletListItem: defaultBlockSpecs.bulletListItem,
        numberedListItem: defaultBlockSpecs.numberedListItem,
        checkListItem: defaultBlockSpecs.checkListItem,
        table: defaultBlockSpecs.table,
        quote: defaultBlockSpecs.quote,
        divider: defaultBlockSpecs.divider,
        codeBlock: defaultBlockSpecs.codeBlock,
    },
});

export type NoteSchemaPartialBlock = typeof noteBlockSchema.PartialBlock;

export function noteBlockFloatingPortals(
    floatingPortalElement: HTMLElement,
): PortalElementsMap {
    return {
        sideMenu: floatingPortalElement,
        tableHandles: floatingPortalElement,
        formattingToolbar: floatingPortalElement,
        slashMenu: floatingPortalElement,
        linkToolbar: floatingPortalElement,
    };
}

/** Selectors for BlockNote UI that must not dismiss the note sheet. */
export const NOTE_BLOCK_OVERLAY_SELECTOR =
    '.bn-container, .bn-menu, .bn-toolbar, .bn-popover, .bn-side-menu, .bn-table-cell-handle, .bn-table-handle, .bn-table-handle-menu, .bn-drag-handle-menu, [data-radix-popper-content-wrapper], [data-slot="popover-content"]';

export function isNoteBlockOverlayTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest(NOTE_BLOCK_OVERLAY_SELECTOR));
}
