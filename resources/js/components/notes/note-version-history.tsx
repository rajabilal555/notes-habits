'use client';

import { router, useHttp } from '@inertiajs/react';
import { History } from 'lucide-react';
import { useEffect, useState } from 'react';
import NoteVersionController from '@/actions/App/Http/Controllers/NoteVersionController';
import { NoteContentPreview } from '@/components/notes/note-content-preview';
import { NoteToolbarButton } from '@/components/notes/note-toolbar-button';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { contentPlainText, hasNoteContent } from '@/lib/note-content';
import type { NoteVersion } from '@/types/note-version';

type VersionsResponse = {
    versions: NoteVersion[];
};

function formatVersionTime(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function versionSummary(version: NoteVersion): string {
    const title = version.title?.trim();
    if (title) {
        return title;
    }

    const body = contentPlainText(version.content);
    if (body) {
        return body.slice(0, 80);
    }

    return 'Empty note';
}

function NoteVersionPreview({
    version,
    restoring,
    onRestore,
}: {
    version: NoteVersion;
    restoring: boolean;
    onRestore: () => void;
}) {
    const title = version.title?.trim() || null;
    const hasBody = hasNoteContent(version.content);

    return (
        <li className="flex items-start gap-2 px-3 py-2">
            <Popover modal={false}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="hover:bg-accent/50 min-w-0 flex-1 rounded-md px-1 py-0.5 text-left transition-colors"
                    >
                        <p className="truncate text-sm">
                            {versionSummary(version)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            {formatVersionTime(version.created_at)}
                        </p>
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    side="left"
                    align="start"
                    className="w-80 max-w-[min(20rem,calc(100vw-2rem))] p-3"
                >
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">
                                {title ?? 'Untitled'}
                            </p>
                            <p className="text-muted-foreground text-xs">
                                {formatVersionTime(version.created_at)}
                            </p>
                        </div>
                    </div>
                    {hasBody ? (
                        <div className="max-h-64 overflow-y-auto">
                            <NoteContentPreview
                                content={version.content}
                                className="max-h-none"
                            />
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm italic">
                            No body content
                        </p>
                    )}
                </PopoverContent>
            </Popover>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 px-2 text-xs"
                disabled={restoring}
                onClick={onRestore}
            >
                {restoring ? '…' : 'Restore'}
            </Button>
        </li>
    );
}

type NoteVersionHistoryProps = {
    noteId: number;
    onRestored: (version: NoteVersion) => void;
};

export function NoteVersionHistory({
    noteId,
    onRestored,
}: NoteVersionHistoryProps) {
    const [open, setOpen] = useState(false);
    const [versions, setVersions] = useState<NoteVersion[]>([]);
    const [restoringId, setRestoringId] = useState<number | null>(null);

    const { get, processing, cancel } = useHttp<
        Record<string, never>,
        VersionsResponse
    >({});

    useEffect(() => {
        if (!open) {
            return;
        }

        void get(NoteVersionController.index.url(noteId), {
            onSuccess: (payload) => {
                setVersions(payload.versions);
            },
            onHttpException: () => {
                setVersions([]);
            },
            onNetworkError: () => {
                setVersions([]);
            },
        });

        return () => cancel();
        // get/cancel are recreated each render; only refetch when the panel opens or note changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, noteId]);

    const restore = (version: NoteVersion) => {
        if (
            !window.confirm(
                'Restore this version? Your current title and content will be saved to history first if they changed.',
            )
        ) {
            return;
        }

        setRestoringId(version.id);

        router.post(
            NoteVersionController.restore.url({
                note: noteId,
                version: version.id,
            }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    onRestored(version);
                    setOpen(false);
                },
                onFinish: () => setRestoringId(null),
            },
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <NoteToolbarButton aria-label="Version history">
                    <History className="size-4" />
                </NoteToolbarButton>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 p-0">
                <div className="border-b px-3 py-2">
                    <p className="text-sm font-medium">Version history</p>
                    <p className="text-muted-foreground text-xs">
                        Snapshots from each save · click a row to preview
                    </p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                    {processing ? (
                        <p className="text-muted-foreground px-3 py-4 text-sm">
                            Loading…
                        </p>
                    ) : versions.length === 0 ? (
                        <p className="text-muted-foreground px-3 py-4 text-sm">
                            No previous versions yet
                        </p>
                    ) : (
                        <ul className="divide-y">
                            {versions.map((version) => (
                                <NoteVersionPreview
                                    key={version.id}
                                    version={version}
                                    restoring={restoringId !== null}
                                    onRestore={() => restore(version)}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
