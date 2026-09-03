<?php

namespace App\Models;

use Database\Factories\NoteAttachmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $note_id
 * @property string $original_name
 * @property string $path
 * @property string|null $mime_type
 * @property int $size
 * @property string $disk
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['note_id', 'original_name', 'path', 'mime_type', 'size', 'disk'])]
class NoteAttachment extends Model
{
    /** @use HasFactory<NoteAttachmentFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::deleting(function (NoteAttachment $attachment): void {
            Storage::disk($attachment->disk)->delete($attachment->path);
        });
    }

    /**
     * @return BelongsTo<Note, $this>
     */
    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }

    public function isImage(): bool
    {
        return str_starts_with((string) $this->mime_type, 'image/');
    }

    public function url(): string
    {
        return route('notes.attachments.show', [$this->note_id, $this->id]);
    }

    public function markdownSnippet(): string
    {
        $name = str_replace(['[', ']', '(', ')'], '', $this->original_name);
        $url = $this->url();

        if ($this->isImage()) {
            return "![{$name}]({$url})";
        }

        return "[{$name}]({$url})";
    }
}
