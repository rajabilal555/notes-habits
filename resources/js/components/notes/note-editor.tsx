'use client';

import { Suspense, lazy } from 'react';
import {
    hasNoteContent,
    isLegacyContent,
    normalizeNoteContent,
    type NoteContent,
} from '@/lib/note-content';
import { cn } from '@/lib/utils';

const NoteMdxEditor = lazy(() => import('@/components/notes/note-mdx-editor'));

type NoteEditorProps = {
    content?: NoteContent | null;
    className?: string;
    onChange?: (content: NoteContent | null) => void;
};

export function NoteEditor({ content, className, onChange }: NoteEditorProps) {
    const legacy = isLegacyContent(content);
    const initialMarkdown = legacy ? '' : normalizeNoteContent(content);

    return (
        <div className={cn('note-editor flex min-h-0 flex-1 flex-col', className)}>
            {legacy ? (
                <p className="text-muted-foreground px-4 pb-2 text-sm">
                    Legacy note content is shown on the card only. Saving will
                    replace it with a new note.
                </p>
            ) : null}
            <Suspense
                fallback={
                    <div className="text-muted-foreground px-4 py-2 text-sm">
                        Loading editor...
                    </div>
                }
            >
                <NoteMdxEditor
                    markdown={initialMarkdown}
                    placeholder="Take a note..."
                    onChange={(markdown) => {
                        if (!onChange) {
                            return;
                        }

                        onChange(
                            hasNoteContent(markdown) ? markdown.trim() : null,
                        );
                    }}
                />
            </Suspense>
        </div>
    );
}
