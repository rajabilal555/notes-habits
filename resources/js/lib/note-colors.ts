export const NOTE_COLORS = [
    { id: 'default', label: 'Default', className: 'bg-card' },
    { id: 'coral', label: 'Coral', className: 'bg-rose-100 dark:bg-rose-950/50' },
    { id: 'peach', label: 'Peach', className: 'bg-orange-100 dark:bg-orange-950/50' },
    { id: 'sand', label: 'Sand', className: 'bg-amber-100 dark:bg-amber-950/50' },
    { id: 'mint', label: 'Mint', className: 'bg-emerald-100 dark:bg-emerald-950/50' },
    { id: 'sage', label: 'Sage', className: 'bg-lime-100 dark:bg-lime-950/50' },
    { id: 'fog', label: 'Fog', className: 'bg-cyan-100 dark:bg-cyan-950/50' },
    { id: 'storm', label: 'Storm', className: 'bg-sky-100 dark:bg-sky-950/50' },
    { id: 'dusk', label: 'Dusk', className: 'bg-indigo-100 dark:bg-indigo-950/50' },
    { id: 'blossom', label: 'Blossom', className: 'bg-fuchsia-100 dark:bg-fuchsia-950/50' },
    { id: 'clay', label: 'Clay', className: 'bg-stone-200 dark:bg-stone-800/50' },
] as const;

export type NoteColorId = (typeof NOTE_COLORS)[number]['id'];

export function noteColorClassName(color: NoteColorId): string {
    return NOTE_COLORS.find((entry) => entry.id === color)?.className ?? NOTE_COLORS[0].className;
}
