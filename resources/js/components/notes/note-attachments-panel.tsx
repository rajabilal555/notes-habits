'use client';

import { useHttp } from '@inertiajs/react';
import { Check, ChevronDown, Copy, Paperclip, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import NoteAttachmentController from '@/actions/App/Http/Controllers/NoteAttachmentController';
import { NoteToolbarButton } from '@/components/notes/note-toolbar-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NoteAttachment } from '@/types/note-attachment';

type AttachmentsResponse = {
    attachments: NoteAttachment[];
};

type UploadResponse = {
    attachment: NoteAttachment;
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type NoteAttachmentsPanelProps = {
    noteId: number;
};

export function NoteAttachmentsPanel({ noteId }: NoteAttachmentsPanelProps) {
    const [open, setOpen] = useState(false);
    const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const list = useHttp<Record<string, never>, AttachmentsResponse>({});
    const upload = useHttp<{ file: File | null }, UploadResponse>({
        file: null,
    });
    const destroy = useHttp<Record<string, never>, { ok: boolean }>({});

    const loadAttachments = () => {
        void list.get(NoteAttachmentController.index.url(noteId), {
            onSuccess: (payload) => {
                setAttachments(payload.attachments);
            },
            onHttpException: () => {
                setAttachments([]);
            },
            onNetworkError: () => {
                setAttachments([]);
            },
        });
    };

    useEffect(() => {
        loadAttachments();

        return () => {
            list.cancel();
            upload.cancel();
            destroy.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [noteId]);

    useEffect(() => {
        if (open) {
            loadAttachments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleUpload = (files: FileList | null) => {
        const file = files?.[0];

        if (!file) {
            return;
        }

        setUploadError(null);
        upload.setData('file', file);
        void upload.post(NoteAttachmentController.store.url(noteId), {
            onSuccess: (payload) => {
                setAttachments((current) => [payload.attachment, ...current]);
                upload.reset();
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            },
            onHttpException: () => {
                setUploadError('Upload failed. Max size is 20 MB.');
            },
            onError: () => {
                setUploadError('Upload failed. Check the file and try again.');
            },
            onNetworkError: () => {
                setUploadError('Upload failed. Check your connection.');
            },
        });
    };

    const copyMarkdown = async (attachment: NoteAttachment) => {
        try {
            await navigator.clipboard.writeText(attachment.markdown);
            setCopiedId(attachment.id);
            window.setTimeout(() => {
                setCopiedId((current) =>
                    current === attachment.id ? null : current,
                );
            }, 1500);
        } catch {
            setUploadError('Could not copy markdown link.');
        }
    };

    const remove = (attachment: NoteAttachment) => {
        if (!window.confirm(`Delete "${attachment.original_name}"?`)) {
            return;
        }

        void destroy.delete(
            NoteAttachmentController.destroy.url({
                note: noteId,
                attachment: attachment.id,
            }),
            {
                onSuccess: () => {
                    setAttachments((current) =>
                        current.filter((item) => item.id !== attachment.id),
                    );
                },
            },
        );
    };

    return (
        <>
            {open ? (
                <div className="bg-background/95 absolute inset-x-0 bottom-full z-20 max-h-56 overflow-hidden border-t border-black/5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:border-white/10 dark:shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center justify-between gap-2 border-b border-black/5 px-3 py-2 dark:border-white/10">
                        <div>
                            <p className="text-sm font-medium">Attachments</p>
                            <p className="text-muted-foreground text-xs">
                                Copy markdown to insert in the note
                            </p>
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(event) =>
                                    handleUpload(event.target.files)
                                }
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 px-2 text-xs"
                                disabled={upload.processing}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="size-3.5" />
                                {upload.processing ? 'Uploading…' : 'Upload'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                aria-label="Collapse attachments"
                                onClick={() => setOpen(false)}
                            >
                                <ChevronDown className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-40 overflow-y-auto">
                        {uploadError ? (
                            <p className="text-destructive px-3 py-2 text-xs">
                                {uploadError}
                            </p>
                        ) : null}
                        {list.processing && attachments.length === 0 ? (
                            <p className="text-muted-foreground px-3 py-4 text-sm">
                                Loading…
                            </p>
                        ) : attachments.length === 0 ? (
                            <p className="text-muted-foreground px-3 py-4 text-sm">
                                No attachments yet
                            </p>
                        ) : (
                            <ul className="divide-y divide-black/5 dark:divide-white/10">
                                {attachments.map((attachment) => (
                                    <li
                                        key={attachment.id}
                                        className="flex items-center gap-2 px-3 py-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm">
                                                {attachment.original_name}
                                            </p>
                                            <p className="text-muted-foreground text-xs">
                                                {formatBytes(attachment.size)}
                                                {attachment.is_image
                                                    ? ' · image'
                                                    : ''}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 shrink-0 px-2"
                                            aria-label={`Copy markdown for ${attachment.original_name}`}
                                            onClick={() =>
                                                void copyMarkdown(attachment)
                                            }
                                        >
                                            {copiedId === attachment.id ? (
                                                <Check className="size-3.5" />
                                            ) : (
                                                <Copy className="size-3.5" />
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive h-7 shrink-0 px-2"
                                            aria-label={`Delete ${attachment.original_name}`}
                                            disabled={destroy.processing}
                                            onClick={() => remove(attachment)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            ) : null}

            <NoteToolbarButton
                type="button"
                aria-label="Attachments"
                aria-expanded={open}
                active={open || attachments.length > 0}
                className="relative"
                onClick={() => setOpen((current) => !current)}
            >
                <Paperclip className="size-4" />
                {attachments.length > 0 ? (
                    <span
                        className={cn(
                            'bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none',
                        )}
                    >
                        {attachments.length}
                    </span>
                ) : null}
            </NoteToolbarButton>
        </>
    );
}
