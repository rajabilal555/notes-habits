'use client';

import { generateHTML } from '@tiptap/html';

import { createMinimalTiptapExtensions } from '@/components/ui/minimal-tiptap/hooks/use-minimal-tiptap';
import {
    hasNoteContent,
    normalizeNoteContent,
    type NoteContent,
} from '@/lib/note-content';
import { cn } from '@/lib/utils';

type NoteContentPreviewProps = {
    content: NoteContent | null;
    className?: string;
};

const previewExtensions = createMinimalTiptapExtensions({ output: 'json' });

export function NoteContentPreview({
    content,
    className,
}: NoteContentPreviewProps) {
    if (!hasNoteContent(content)) {
        return null;
    }

    const html = generateHTML(
        normalizeNoteContent(content),
        previewExtensions,
    );

    return (
        <div
            className={cn('note-content-preview', className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
