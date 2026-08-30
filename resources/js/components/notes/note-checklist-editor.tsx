import { Plus, Trash2 } from 'lucide-react';
import type { ChecklistItemDraft } from '@/lib/note-checklist';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function reindex(items: ChecklistItemDraft[]): ChecklistItemDraft[] {
    return items.map((item, index) => ({
        ...item,
        sort_order: index,
    }));
}

export function NoteChecklistEditor({
    items,
    onChange,
    variant = 'default',
}: {
    items: ChecklistItemDraft[];
    onChange: (items: ChecklistItemDraft[]) => void;
    variant?: 'default' | 'inline';
}) {
    const updateItem = (index: number, patch: Partial<ChecklistItemDraft>) => {
        onChange(
            reindex(
                items.map((item, itemIndex) =>
                    itemIndex === index ? { ...item, ...patch } : item,
                ),
            ),
        );
    };

    const removeItem = (index: number) => {
        onChange(reindex(items.filter((_, itemIndex) => itemIndex !== index)));
    };

    const addItem = () => {
        onChange(
            reindex([
                ...items,
                {
                    text: '',
                    is_checked: false,
                    sort_order: items.length,
                },
            ]),
        );
    };

    if (variant === 'inline') {
        return (
            <ul className="space-y-2 px-4 pb-2">
                {items.map((item, index) => (
                    <li
                        key={item.id ?? `new-${index}`}
                        className="group flex items-start gap-2"
                    >
                        <Checkbox
                            checked={item.is_checked}
                            onCheckedChange={(checked) =>
                                updateItem(index, {
                                    is_checked: checked === true,
                                })
                            }
                            className="mt-1"
                        />
                        <Input
                            value={item.text}
                            onChange={(event) =>
                                updateItem(index, {
                                    text: event.target.value,
                                })
                            }
                            placeholder="List item"
                            className={cn(
                                'h-auto flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0',
                                item.is_checked &&
                                    'text-muted-foreground line-through',
                            )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive size-7 shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={() => removeItem(index)}
                            aria-label="Remove item"
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </li>
                ))}
                <li>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground h-8 px-2"
                        onClick={addItem}
                    >
                        <Plus className="size-4" />
                        Add item
                    </Button>
                </li>
            </ul>
        );
    }

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Checklist</span>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItem}
                >
                    <Plus className="size-4" />
                    Add item
                </Button>
            </div>

            {items.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    No checklist items yet.
                </p>
            ) : (
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li
                            key={item.id ?? `new-${index}`}
                            className="flex items-start gap-2"
                        >
                            <Checkbox
                                checked={item.is_checked}
                                onCheckedChange={(checked) =>
                                    updateItem(index, {
                                        is_checked: checked === true,
                                    })
                                }
                                className="mt-2"
                            />
                            <Input
                                value={item.text}
                                onChange={(event) =>
                                    updateItem(index, {
                                        text: event.target.value,
                                    })
                                }
                                placeholder="List item"
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive size-8"
                                onClick={() => removeItem(index)}
                                aria-label="Remove item"
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
