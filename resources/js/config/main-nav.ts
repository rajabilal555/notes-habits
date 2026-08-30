import { LayoutGrid, Repeat, StickyNote } from 'lucide-react';
import { dashboard } from '@/routes';
import { index as habitsIndex } from '@/routes/habits';
import { index as notesIndex } from '@/routes/notes';
import type { NavItem } from '@/types';

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Notes',
        href: notesIndex(),
        icon: StickyNote,
    },
    {
        title: 'Habits',
        href: habitsIndex(),
        icon: Repeat,
    },
];
