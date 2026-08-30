import type { PortalElementsMap } from '@blocknote/react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/shadcn';
import { useEffect, useMemo } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import type { NoteBlock } from '@/lib/note-block-progress';
import {
    noteBlockFloatingPortals,
    noteBlockSchema,
    type NoteSchemaPartialBlock,
} from '@/lib/note-block-schema';
import { cn } from '@/lib/utils';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/shadcn/style.css';

type NoteBlockViewProps = {
    content?: NoteBlock[] | null;
    className?: string;
    onChange?: (content: NoteBlock[]) => void;
    floatingPortalElement?: HTMLElement | null;
};

export function NoteBlockView({
    content,
    className,
    onChange,
    floatingPortalElement = null,
}: NoteBlockViewProps) {
    const { resolvedAppearance } = useAppearance();

    const editor = useCreateBlockNote({
        schema: noteBlockSchema,
        initialContent: (content ?? undefined) as
            | NoteSchemaPartialBlock[]
            | undefined,
    });

    const portalElements = useMemo(
        (): PortalElementsMap | undefined =>
            floatingPortalElement
                ? noteBlockFloatingPortals(floatingPortalElement)
                : undefined,
        [floatingPortalElement],
    );

    useEffect(() => {
        if (!onChange) {
            return;
        }

        return editor.onChange(() => {
            onChange(editor.document);
        });
    }, [editor, onChange]);

    return (
        <BlockNoteView
            editor={editor}
            theme={resolvedAppearance}
            className={cn('note-block-view bn-shadcn', className)}
            portalElements={portalElements}
        />
    );
}
