export type NoteContent = string;

export function isLegacyContent(content: string | null | undefined): boolean {
    if (!content?.trim()) {
        return false;
    }

    const trimmed = content.trimStart();

    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return false;
    }

    try {
        const parsed = JSON.parse(content) as unknown;

        return typeof parsed === 'object' && parsed !== null;
    } catch {
        return false;
    }
}

export function hasNoteContent(
    content: string | null | undefined,
): boolean {
    if (!content?.trim()) {
        return false;
    }

    if (isLegacyContent(content)) {
        return true;
    }

    return content.trim() !== '';
}

export function normalizeNoteContent(
    content: string | null | undefined,
): string {
    if (!content || isLegacyContent(content)) {
        return '';
    }

    return content;
}

export function blockChecklistProgress(
    content: string | null | undefined,
): {
    checked: number;
    total: number;
} {
    if (!content?.trim() || isLegacyContent(content)) {
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
