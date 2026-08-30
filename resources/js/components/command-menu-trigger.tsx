import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommandMenu } from '@/hooks/use-command-menu';
import { cn } from '@/lib/utils';

export function CommandMenuTrigger({
    className,
    variant = 'outline',
}: {
    className?: string;
    variant?: 'outline' | 'ghost';
}) {
    const { setOpen } = useCommandMenu();

    return (
        <Button
            type="button"
            variant={variant}
            className={cn(
                'text-muted-foreground relative h-9 w-full justify-start gap-2 px-3 font-normal sm:w-56',
                className,
            )}
            onClick={() => setOpen(true)}
        >
            <Search className="size-4 shrink-0" />
            <span className="flex-1 truncate text-left">Search…</span>
            <kbd className="bg-muted pointer-events-none ml-auto hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium sm:flex">
                <span className="text-xs">⌘</span>K
            </kbd>
        </Button>
    );
}
