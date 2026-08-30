<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateNoteItemRequest;
use App\Models\Note;
use App\Models\NoteItem;
use Illuminate\Http\RedirectResponse;

class NoteItemController extends Controller
{
    public function update(UpdateNoteItemRequest $request, Note $note, NoteItem $item): RedirectResponse
    {
        $this->authorize('update', $note);

        abort_if($item->note_id !== $note->id, 404);

        $item->update($request->validated());
        $note->touch();

        return back();
    }
}
