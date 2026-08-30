import { Label } from '@/components/ui/label';
import { NoteLabelPickerContent } from '@/components/notes/note-label-picker-content';
import type { Label as LabelType } from '@/types/label';

export function NoteLabelPicker({
    availableLabels,
    attachedLabels = [],
    selectedIds,
    newNames,
    onSelectedIdsChange,
    onNewNamesChange,
}: {
    availableLabels: LabelType[];
    attachedLabels?: LabelType[];
    selectedIds: number[];
    newNames: string[];
    onSelectedIdsChange: (ids: number[]) => void;
    onNewNamesChange: (names: string[]) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label>Labels</Label>
            <NoteLabelPickerContent
                availableLabels={availableLabels}
                attachedLabels={attachedLabels}
                selectedIds={selectedIds}
                newNames={newNames}
                onSelectedIdsChange={onSelectedIdsChange}
                onNewNamesChange={onNewNamesChange}
            />
        </div>
    );
}
