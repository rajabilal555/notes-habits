function pad(n: number): string {
    return String(n).padStart(2, '0');
}

export function toDatetimeLocalValue(value: string | Date | null): string {
    if (!value) {
        return '';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function timeFromDatetimeLocal(value: string): string {
    if (!value.includes('T')) {
        return '';
    }

    const [, time = ''] = value.split('T');

    return time.slice(0, 5);
}

export function dateFromDatetimeLocal(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? undefined : date;
}

export function combineDateAndTime(
    date: Date | undefined,
    time: string,
): string {
    if (!date && !time) {
        return '';
    }

    const base = date ?? new Date();
    const fallbackTime = `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`;
    const [hours = '0', minutes = '0'] = (time || fallbackTime).split(':');

    return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(Number(hours))}:${pad(Number(minutes))}`;
}

export function formatReminder(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}
