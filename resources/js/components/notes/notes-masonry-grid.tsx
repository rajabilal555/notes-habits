import type { ReactNode } from 'react';

export function NotesMasonryGrid({ children }: { children: ReactNode }) {
    return (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
            {children}
        </div>
    );
}
