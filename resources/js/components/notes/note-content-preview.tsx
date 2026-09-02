'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    hasNoteContent,
    isLegacyContent,
    type NoteContent,
} from '@/lib/note-content';
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

    if (isLegacyContent(content)) {
        return (
            <pre
                className={cn(
                    'note-content-preview text-muted-foreground max-h-52 overflow-hidden text-xs break-words whitespace-pre-wrap',
                    className,
                )}
            >
                {content}
            </pre>
        );
    }

    return (
        <div
            className={cn(
                'note-content-preview prose prose-sm dark:prose-invert max-w-none text-base break-words',
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
