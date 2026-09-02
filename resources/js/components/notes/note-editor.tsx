'use client';

import { Suspense, lazy } from 'react';
import { hasNoteContent, type NoteContent } from '@/lib/note-content';
import { cn } from '@/lib/utils';

const NoteAtomicEditor = lazy(
    () => import('@/components/notes/note-atomic-editor'),
);

type NoteEditorProps = {
    content?: NoteContent | null;
    documentId: string;
    className?: string;
    autoFocus?: boolean;
    onChange?: (content: NoteContent | null) => void;
};

export function NoteEditor({
    content,
    documentId,
    className,
    autoFocus = false,
    onChange,
}: NoteEditorProps) {
    return (
        <div className={cn('note-editor flex min-h-0 flex-1 flex-col', className)}>
            <div className="flex min-h-0 flex-1 flex-col">
                <Suspense
                    fallback={
                        <div className="text-muted-foreground px-4 py-2 text-sm">
                            Loading editor...
                        </div>
                    }
                >
                    <NoteAtomicEditor
                        autoFocus={autoFocus}
                        documentId={documentId}
                        markdownSource={content ?? ''}
                        onMarkdownChange={(markdown) => {
                            if (!onChange) {
                                return;
                            }

                            onChange(
                                hasNoteContent(markdown)
                                    ? markdown.trim()
                                    : null,
                            );
                        }}
                    />
                </Suspense>
            </div>
        </div>
    );
}
