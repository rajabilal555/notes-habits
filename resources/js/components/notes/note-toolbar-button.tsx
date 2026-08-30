import { cn } from '@/lib/utils';

export function NoteToolbarButton({
    active = false,
    className,
    ...props
}: React.ComponentProps<'button'> & { active?: boolean }) {
    return (
        <button
            type="button"
            className={cn(
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex size-9 items-center justify-center rounded-full transition-colors',
                active && 'bg-accent text-accent-foreground',
                className,
            )}
            {...props}
        />
    );
}
