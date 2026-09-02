import { AtomicCodeMirrorEditor, type AtomicCodeMirrorEditorHandle } from '@atomic-editor/editor';
import '@atomic-editor/editor/styles.css';
import { useEffect, useRef } from 'react';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type NoteAtomicEditorProps = {
    markdownSource: string;
    documentId: string;
    className?: string;
    autoFocus?: boolean;
    onMarkdownChange?: (markdown: string) => void;
};

export default function NoteAtomicEditor({
    markdownSource,
    documentId,
    className,
    autoFocus = false,
    onMarkdownChange,
}: NoteAtomicEditorProps) {
    const { resolvedAppearance } = useAppearance();
    const editorHandleRef = useRef<AtomicCodeMirrorEditorHandle | null>(null);

    useEffect(() => {
        if (!autoFocus) {
            return;
        }

        const frame = requestAnimationFrame(() => {
            editorHandleRef.current?.focus();
        });

        return () => cancelAnimationFrame(frame);
    }, [autoFocus, documentId]);

    return (
        <div
            className={cn('note-atomic-editor', className)}
            data-theme={resolvedAppearance === 'light' ? 'light' : undefined}
        >
            <AtomicCodeMirrorEditor
                markdownSource={markdownSource}
                documentId={documentId}
                editorHandleRef={editorHandleRef}
                onMarkdownChange={onMarkdownChange}
                onLinkClick={(url) =>
                    window.open(url, '_blank', 'noopener,noreferrer')
                }
            />
        </div>
    );
}
