import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { NoteBlock } from '@/lib/note-block-progress';
import { blocksToPreviewMarkdown } from '@/lib/note-block-markdown';
import { cn } from '@/lib/utils';

type NoteBlockPreviewProps = {
    content: NoteBlock[] | null;
    className?: string;
};

export function NoteBlockPreview({ content, className }: NoteBlockPreviewProps) {
    const [markdown, setMarkdown] = useState('');

    useEffect(() => {
        let cancelled = false;

        void blocksToPreviewMarkdown(content).then((next) => {
            if (!cancelled) {
                setMarkdown(next);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [content]);

    if (markdown === '') {
        return null;
    }

    return (
        <div className={cn('note-block-preview', className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
    );
}
