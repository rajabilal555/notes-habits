export type NoteContent = string;

export function hasNoteContent(
    content: string | null | undefined,
): boolean {
    return Boolean(content?.trim());
}

export function contentPlainText(
    content: NoteContent | null | undefined,
): string {
    if (!content?.trim()) {
        return '';
    }

    return content
        .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/[#*_`[\]()]/g, '')
        .trim();
}

export function blockChecklistProgress(
    content: string | null | undefined,
): {
    checked: number;
    total: number;
} {
    if (!content?.trim()) {
        return { checked: 0, total: 0 };
    }

    const lines = content.split('\n');
    let checked = 0;
    let total = 0;

    for (const line of lines) {
        const match = line.match(/^\s*[-*+]\s+\[([ xX])\]\s+/);

        if (!match) {
            continue;
        }

        total += 1;

        if (match[1].toLowerCase() === 'x') {
            checked += 1;
        }
    }

    return { checked, total };
}
