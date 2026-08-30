import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { ChecklistItemDraft } from '@/lib/note-checklist';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function reindex(items: ChecklistItemDraft[]): ChecklistItemDraft[] {
    return items.map((item, index) => ({
        ...item,
        sort_order: index,
    }));
}

export function NoteChecklistEditor({
    items,
    onChange,
}: {
    items: ChecklistItemDraft[];
    onChange: (items: ChecklistItemDraft[]) => void;
}) {
    const updateItem = (
        index: number,
        patch: Partial<ChecklistItemDraft>,
    ) => {
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

    const moveItem = (index: number, direction: -1 | 1) => {
        const target = index + direction;

        if (target < 0 || target >= items.length) {
            return;
        }

        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(reindex(next));
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

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between">
                <Label>Checklist</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
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
                            <div className="flex shrink-0 gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    disabled={index === 0}
                                    onClick={() => moveItem(index, -1)}
                                    aria-label="Move up"
                                >
                                    <ChevronUp className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    disabled={index === items.length - 1}
                                    onClick={() => moveItem(index, 1)}
                                    aria-label="Move down"
                                >
                                    <ChevronDown className="size-4" />
                                </Button>
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
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}