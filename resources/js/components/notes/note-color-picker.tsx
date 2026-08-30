import { NOTE_COLORS, type NoteColorId } from '@/lib/note-colors';
import { cn } from '@/lib/utils';

export function NoteColorPicker({
    value,
    onChange,
    name = 'color',
}: {
    value: NoteColorId;
    onChange: (color: NoteColorId) => void;
    name?: string;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <input type="hidden" name={name} value={value} />
            {NOTE_COLORS.map((color) => (
                <button
                    key={color.id}
                    type="button"
                    aria-label={color.label}
                    aria-pressed={value === color.id}
                    onClick={() => onChange(color.id)}
                    className={cn(
                        'size-8 rounded-full border-2 transition-transform hover:scale-105',
                        color.className,
                        value === color.id
                            ? 'border-foreground ring-ring ring-2 ring-offset-2'
                            : 'border-transparent',
                    )}
                />
            ))}
        </div>
    );
}
