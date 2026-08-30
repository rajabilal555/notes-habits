import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Label as LabelType } from '@/types/label';

export function NoteLabelPicker({
    availableLabels,
    selectedIds,
    newNames,
    onSelectedIdsChange,
    onNewNamesChange,
}: {
    availableLabels: LabelType[];
    selectedIds: number[];
    newNames: string[];
    onSelectedIdsChange: (ids: number[]) => void;
    onNewNamesChange: (names: string[]) => void;
}) {
    const [draft, setDraft] = useState('');

    const toggleId = (id: number) => {
        onSelectedIdsChange(
            selectedIds.includes(id)
                ? selectedIds.filter((value) => value !== id)
                : [...selectedIds, id],
        );
    };

    const addName = () => {
        const name = draft.trim();

        if (name === '' || newNames.includes(name)) {
            return;
        }

        onNewNamesChange([...newNames, name]);
        setDraft('');
    };

    return (
        <div className="grid gap-2">
            <Label>Labels</Label>
            {availableLabels.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                    {availableLabels.map((label) => (
                        <label
                            key={label.id}
                            className="flex items-center gap-2 text-sm"
                        >
                            <Checkbox
                                checked={selectedIds.includes(label.id)}
                                onCheckedChange={() => toggleId(label.id)}
                            />
                            {label.name}
                        </label>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-sm">
                    No labels yet. Add one below.
                </p>
            )}
            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="New label name"
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            addName();
                        }
                    }}
                />
                <Button type="button" variant="outline" onClick={addName}>
                    Add
                </Button>
            </div>
            {newNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {newNames.map((name) => (
                        <Badge key={name} variant="secondary">
                            {name}
                        </Badge>
                    ))}
                </div>
            ) : null}
            {selectedIds.map((id, index) => (
                <input
                    key={id}
                    type="hidden"
                    name={`label_ids[${index}]`}
                    value={id}
                />
            ))}
            {newNames.map((name, index) => (
                <input
                    key={name}
                    type="hidden"
                    name={`label_names[${index}]`}
                    value={name}
                />
            ))}
        </div>
    );
}
