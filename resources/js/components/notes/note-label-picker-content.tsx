import { Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { Label as LabelType } from '@/types/label';

function mergeLabels(
    availableLabels: LabelType[],
    attachedLabels: LabelType[],
): LabelType[] {
    const byId = new Map<number, LabelType>();

    for (const label of [...availableLabels, ...attachedLabels]) {
        byId.set(label.id, label);
    }

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function NoteLabelPickerContent({
    availableLabels,
    attachedLabels = [],
    selectedIds,
    newNames,
    onSelectedIdsChange,
    onNewNamesChange,
    onDeleteLabel,
}: {
    availableLabels: LabelType[];
    attachedLabels?: LabelType[];
    selectedIds: number[];
    newNames: string[];
    onSelectedIdsChange: (ids: number[]) => void;
    onNewNamesChange: (names: string[]) => void;
    onDeleteLabel?: (label: LabelType) => void;
}) {
    const [draft, setDraft] = useState('');

    const allLabels = useMemo(
        () => mergeLabels(availableLabels, attachedLabels),
        [availableLabels, attachedLabels],
    );

    const selectedLabels = allLabels.filter((label) =>
        selectedIds.includes(label.id),
    );

    const toggleId = (id: number) => {
        onSelectedIdsChange(
            selectedIds.includes(id)
                ? selectedIds.filter((value) => value !== id)
                : [...selectedIds, id],
        );
    };

    const removeNewName = (name: string) => {
        onNewNamesChange(newNames.filter((value) => value !== name));
    };

    const addName = () => {
        const name = draft.trim();

        if (name === '') {
            return;
        }

        const existing = allLabels.find(
            (label) => label.name.toLowerCase() === name.toLowerCase(),
        );

        if (existing) {
            if (!selectedIds.includes(existing.id)) {
                onSelectedIdsChange([...selectedIds, existing.id]);
            }

            setDraft('');
            return;
        }

        if (
            newNames.some((value) => value.toLowerCase() === name.toLowerCase())
        ) {
            setDraft('');
            return;
        }

        onNewNamesChange([...newNames, name]);
        setDraft('');
    };

    const hasSelection = selectedLabels.length > 0 || newNames.length > 0;

    return (
        <div className="grid gap-3">
            <p className="text-sm font-medium">Labels</p>

            {hasSelection ? (
                <div className="flex flex-wrap gap-1.5">
                    {selectedLabels.map((label) => (
                        <Badge
                            key={label.id}
                            variant="secondary"
                            className="gap-1 pr-1 text-xs"
                        >
                            {label.name}
                            <button
                                type="button"
                                className="hover:bg-muted rounded-sm p-0.5"
                                aria-label={`Remove ${label.name}`}
                                onClick={() => toggleId(label.id)}
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                    {newNames.map((name) => (
                        <Badge
                            key={name}
                            variant="secondary"
                            className="gap-1 pr-1 text-xs"
                        >
                            {name}
                            <button
                                type="button"
                                className="hover:bg-muted rounded-sm p-0.5"
                                aria-label={`Remove ${name}`}
                                onClick={() => removeNewName(name)}
                            >
                                <X className="size-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            ) : null}

            {allLabels.length > 0 ? (
                <div className="max-h-40 space-y-2 overflow-y-auto">
                    {allLabels.map((label) => (
                        <div
                            key={label.id}
                            className="flex items-center gap-2 text-sm"
                        >
                            <label className="flex flex-1 cursor-pointer items-center gap-2">
                                <Checkbox
                                    checked={selectedIds.includes(label.id)}
                                    onCheckedChange={() => toggleId(label.id)}
                                />
                                {label.name}
                            </label>
                            {onDeleteLabel ? (
                                <button
                                    type="button"
                                    className="text-muted-foreground hover:text-destructive shrink-0 rounded-sm p-1"
                                    aria-label={`Delete label ${label.name}`}
                                    onClick={() => onDeleteLabel(label)}
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            ) : null}
                        </div>
                    ))}
                </div>
            ) : !hasSelection ? (
                <p className="text-muted-foreground text-sm">
                    No labels yet. Add one below.
                </p>
            ) : null}

            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="New label"
                    className="h-8"
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            addName();
                        }
                    }}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addName}
                >
                    Add
                </Button>
            </div>
        </div>
    );
}
