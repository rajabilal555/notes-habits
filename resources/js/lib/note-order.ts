export function normalizeNoteOrder<T extends { is_pinned: boolean }>(
    notes: T[],
): T[] {
    const pinned = notes.filter((note) => note.is_pinned);
    const unpinned = notes.filter((note) => !note.is_pinned);

    return [...pinned, ...unpinned];
}
