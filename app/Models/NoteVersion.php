<?php

namespace App\Models;

use Database\Factories\NoteVersionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $note_id
 * @property string|null $title
 * @property string|null $content
 * @property Carbon|null $created_at
 */
#[Fillable(['note_id', 'title', 'content'])]
class NoteVersion extends Model
{
    /** @use HasFactory<NoteVersionFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @return BelongsTo<Note, $this>
     */
    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }
}
