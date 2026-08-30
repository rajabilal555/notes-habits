<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReorderNotesRequest;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    /**
     * @var list<string>
     */
    private const NOTE_FIELDS = [
        'id',
        'title',
        'body',
        'color',
        'is_pinned',
        'archived_at',
        'reminder_at',
        'created_at',
        'updated_at',
    ];

    public function index(Request $request): Response
    {
        $selectedLabelId = $request->integer('label') ?: null;
        $query = $this->activeNotesQuery($request);

        if ($selectedLabelId && $request->user()->labels()->whereKey($selectedLabelId)->exists()) {
            $query->whereHas('labels', fn ($labels) => $labels->whereKey($selectedLabelId));
        } else {
            $selectedLabelId = null;
        }

        return Inertia::render('notes/index', [
            'notes' => $this->notesWithRelations($query)->get(self::NOTE_FIELDS),
            'labels' => $request->user()->labels()->orderBy('name')->get(['id', 'name', 'color']),
            'selectedLabelId' => $selectedLabelId,
        ]);
    }

    public function archived(Request $request): Response
    {
        return Inertia::render('notes/archived', [
            'notes' => $this->notesWithRelations(
                $request->user()->notes()->archived()->latest('archived_at'),
            )->get(self::NOTE_FIELDS),
            'labels' => $request->user()->labels()->orderBy('name')->get(['id', 'name', 'color']),
        ]);
    }

    public function store(StoreNoteRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $items = $validated['items'] ?? [];
        $labelIds = $validated['label_ids'] ?? [];
        $labelNames = $validated['label_names'] ?? [];
        unset($validated['items'], $validated['label_ids'], $validated['label_names']);

        $minSortOrder = $request->user()
            ->notes()
            ->active()
            ->where('is_pinned', false)
            ->min('sort_order');

        $note = $request->user()->notes()->create([
            ...$validated,
            'sort_order' => $minSortOrder !== null ? $minSortOrder - 1 : 0,
        ]);
        $note->syncItems($items);
        $note->syncLabels($request->user(), $labelIds, $labelNames);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note created.')]);

        return to_route('notes.index');
    }

    public function update(UpdateNoteRequest $request, Note $note): RedirectResponse
    {
        $this->authorize('update', $note);

        $validated = $request->validated();
        $items = $validated['items'] ?? [];
        $labelIds = $validated['label_ids'] ?? [];
        $labelNames = $validated['label_names'] ?? [];
        unset($validated['items'], $validated['label_ids'], $validated['label_names']);

        $note->update($validated);
        $note->syncItems($items);
        $note->syncLabels($request->user(), $labelIds, $labelNames);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note updated.')]);

        return to_route($note->fresh()->isArchived() ? 'notes.archived' : 'notes.index');
    }

    public function reorder(ReorderNotesRequest $request): RedirectResponse
    {
        foreach ($request->validated('note_ids') as $index => $noteId) {
            $request->user()->notes()->whereKey($noteId)->update(['sort_order' => $index]);
        }

        return back();
    }

    public function destroy(Request $request, Note $note): RedirectResponse
    {
        $this->authorize('delete', $note);

        $wasArchived = $note->isArchived();
        $note->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note deleted.')]);

        return to_route($wasArchived ? 'notes.archived' : 'notes.index');
    }

    public function archive(Request $request, Note $note): RedirectResponse
    {
        $this->authorize('update', $note);

        $note->update(['archived_at' => now()]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note archived.')]);

        return to_route('notes.index');
    }

    public function unarchive(Request $request, Note $note): RedirectResponse
    {
        $this->authorize('update', $note);

        $note->update(['archived_at' => null]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Note restored.')]);

        return to_route('notes.index');
    }

    /**
     * @return HasMany<Note, User>
     */
    private function activeNotesQuery(Request $request): HasMany
    {
        return $request->user()
            ->notes()
            ->active()
            ->orderByDesc('is_pinned')
            ->orderBy('sort_order');
    }

    /**
     * @param  HasMany<Note, User>  $query
     * @return HasMany<Note, User>
     */
    private function notesWithRelations(HasMany $query): HasMany
    {
        return $query->with([
            'items' => fn ($items) => $items
                ->select(['id', 'note_id', 'text', 'is_checked', 'sort_order'])
                ->orderBy('sort_order'),
            'labels:id,name,color',
        ]);
    }
}
