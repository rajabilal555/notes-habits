'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { hasNoteContent, type NoteContent } from '@/lib/note-content';
import { cn } from '@/lib/utils';

type NoteContentPreviewProps = {
    content: NoteContent | null;
    className?: string;
};

export function NoteContentPreview({
    content,
    className,
}: NoteContentPreviewProps) {
    if (!hasNoteContent(content)) {
        return null;
    }

    return (
        <div
            className={cn(
                'note-content-preview max-h-52 overflow-hidden text-sm',
                className,
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    input: ({ checked, ...props }) => (
                        <input
                            type="checkbox"
                            checked={checked}
                            readOnly
                            {...props}
                        />
                    ),
                }}
            >
                {content ?? ''}
            </ReactMarkdown>
        </div>
    );
}
