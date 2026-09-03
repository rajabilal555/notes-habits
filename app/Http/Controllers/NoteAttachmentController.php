<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNoteAttachmentRequest;
use App\Models\Note;
use App\Models\NoteAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NoteAttachmentController extends Controller
{
    public function index(Request $request, Note $note): JsonResponse
    {
        $this->authorize('view', $note);

        $attachments = $note->attachments()
            ->latest('id')
            ->get()
            ->map(fn (NoteAttachment $attachment) => $this->serialize($attachment));

        return response()->json(['attachments' => $attachments]);
    }

    public function store(StoreNoteAttachmentRequest $request, Note $note): JsonResponse
    {
        $file = $request->file('file');
        $safeName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid()->toString().($safeName !== '' ? "-{$safeName}" : '').($extension !== '' ? ".{$extension}" : '');
        $directory = "note-attachments/{$note->id}";
        $path = $file->storeAs($directory, $filename, 'local');

        $attachment = $note->attachments()->create([
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'disk' => 'local',
        ]);

        return response()->json([
            'attachment' => $this->serialize($attachment),
        ], 201);
    }

    public function show(Request $request, Note $note, NoteAttachment $attachment): StreamedResponse
    {
        $this->authorize('view', $note);
        abort_unless($attachment->note_id === $note->id, 404);

        abort_unless(
            Storage::disk($attachment->disk)->exists($attachment->path),
            404,
        );

        return Storage::disk($attachment->disk)->response(
            $attachment->path,
            $attachment->original_name,
            [
                'Content-Type' => $attachment->mime_type ?? 'application/octet-stream',
            ],
        );
    }

    public function destroy(Request $request, Note $note, NoteAttachment $attachment): RedirectResponse|JsonResponse
    {
        $this->authorize('update', $note);
        abort_unless($attachment->note_id === $note->id, 404);

        $attachment->delete();

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return back();
    }

    /**
     * @return array{
     *     id: int,
     *     original_name: string,
     *     mime_type: string|null,
     *     size: int,
     *     is_image: bool,
     *     url: string,
     *     markdown: string,
     *     created_at: string|null
     * }
     */
    private function serialize(NoteAttachment $attachment): array
    {
        return [
            'id' => $attachment->id,
            'original_name' => $attachment->original_name,
            'mime_type' => $attachment->mime_type,
            'size' => $attachment->size,
            'is_image' => $attachment->isImage(),
            'url' => $attachment->url(),
            'markdown' => $attachment->markdownSnippet(),
            'created_at' => $attachment->created_at?->toIso8601String(),
        ];
    }
}
