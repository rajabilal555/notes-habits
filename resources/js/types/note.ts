import type { NoteColorId } from '@/lib/note-colors';
import type { NoteItem } from '@/lib/note-checklist';
import type { Label } from '@/types/label';

export type Note = {
    id: number;
    title: string | null;
    body: string | null;
    color: NoteColorId;
    is_pinned: boolean;
    archived_at: string | null;
    reminder_at: string | null;
    created_at: string;
    updated_at: string;
    items: NoteItem[];
    labels: Label[];
};
