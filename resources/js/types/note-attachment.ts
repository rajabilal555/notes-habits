export type NoteAttachment = {
    id: number;
    original_name: string;
    mime_type: string | null;
    size: number;
    is_image: boolean;
    url: string;
    markdown: string;
    created_at: string | null;
};
