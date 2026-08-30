import type { NoteColorId } from '@/lib/note-colors';
import type { NoteBlock } from '@/lib/note-block-progress';
import type { Label } from '@/types/label';

export type Note = {
    id: number;
    title: string | null;
    content: NoteBlock[] | null;
    color: NoteColorId;
    is_pinned: boolean;
    archived_at: string | null;
    reminder_at: string | null;
    created_at: string;
    updated_at: string;
    labels: Label[];
};
