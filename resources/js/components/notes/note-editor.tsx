'use client';

import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap';
import { uploadNoteImage } from '@/lib/note-image-upload';
import {
    hasNoteContent,
    normalizeNoteContent,
    type NoteContent,
} from '@/lib/note-content';
import { cn } from '@/lib/utils';

type NoteEditorProps = {
    content?: NoteContent | null;
    className?: string;
    onChange?: (content: NoteContent | null) => void;
};

export function NoteEditor({ content, className, onChange }: NoteEditorProps) {
    return (
        <MinimalTiptapEditor
            value={content ? normalizeNoteContent(content) : undefined}
            onChange={(value) => {
                if (!onChange) {
                    return;
                }

                const json = value as NoteContent;

                onChange(
                    hasNoteContent(json) ? normalizeNoteContent(json) : null,
                );
            }}
            output="json"
            placeholder="Take a note..."
            throttleDelay={300}
            uploader={uploadNoteImage}
            className={cn(
                'note-editor border-0 bg-transparent shadow-none focus-within:border-transparent focus-within:ring-0',
                className,
            )}
            editorContentClassName="flex min-h-0 flex-1 flex-col px-4 pb-4 text-base"
        />
    );
}
