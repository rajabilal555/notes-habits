import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type NotesSearchInputProps = {
    value: string;
    onChange: (value: string) => void;
    className?: string;
};

export function NotesSearchInput({
    value,
    onChange,
    className,
}: NotesSearchInputProps) {
    return (
        <div className={cn('relative w-full sm:max-w-md', className)}>
            <Search
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                aria-hidden
            />
            <Input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Search notes…"
                aria-label="Search notes"
                className="h-9 pr-9 pl-9"
            />
            {value ? (
                <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 transition-colors"
                    aria-label="Clear search"
                    onClick={() => onChange('')}
                >
                    <X className="size-4" />
                </button>
            ) : null}
        </div>
    );
}
