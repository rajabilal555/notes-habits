export type NoteItem = {
    id: number;
    text: string;
    is_checked: boolean;
    sort_order: number;
};

export type ChecklistItemDraft = {
    id?: number;
    text: string;
    is_checked: boolean;
    sort_order: number;
};

export function checklistProgress(items: Pick<NoteItem, 'is_checked'>[]): {
    checked: number;
    total: number;
} {
    return {
        checked: items.filter((item) => item.is_checked).length,
        total: items.length,
    };
}

export function itemsToDrafts(items: NoteItem[]): ChecklistItemDraft[] {
    return items.map((item) => ({
        id: item.id,
        text: item.text,
        is_checked: item.is_checked,
        sort_order: item.sort_order,
    }));
}
