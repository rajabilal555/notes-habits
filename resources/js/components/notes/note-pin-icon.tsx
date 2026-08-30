import { Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NotePinIcon({
    filled = false,
    className,
    label,
}: {
    filled?: boolean;
    className?: string;
    label?: string;
}) {
    return (
        <Pin
            className={cn('size-4 rotate-45', filled && 'fill-current', className)}
            aria-hidden={label ? undefined : true}
            aria-label={label}
        />
    );
}
