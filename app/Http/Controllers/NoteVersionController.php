<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\NoteVersion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoteVersionController extends Controller
{
    public function index(Request $request, Note $note): JsonResponse
    {
        $this->authorize('update', $note);

        $versions = $note->versions()
            ->get(['id', 'title', 'content', 'created_at'])
            ->map(fn (NoteVersion $version) => [
                'id' => $version->id,
                'title' => $version->title,
                'content' => $version->content,
                'created_at' => $version->created_at?->toIso8601String(),
            ]);

        return response()->json(['versions' => $versions]);
    }

    public function restore(Request $request, Note $note, NoteVersion $version): RedirectResponse
    {
        $this->authorize('update', $note);

        abort_unless($version->note_id === $note->id, 404);

        $note->recordVersionIfChanged();

        $note->update([
            'title' => $version->title,
            'content' => $version->content,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Version restored.')]);

        return back();
    }
}
