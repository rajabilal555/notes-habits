<?php

namespace App\Models;

use App\Enums\NoteColor;
use Database\Factories\NoteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $title
 * @property list<array<string, mixed>>|null $content
 * @property NoteColor $color
 * @property bool $is_pinned
 * @property int $sort_order
 * @property Carbon|null $archived_at
 * @property Carbon|null $reminder_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'title', 'content', 'color', 'is_pinned', 'sort_order', 'archived_at', 'reminder_at'])]
class Note extends Model
{
    /** @use HasFactory<NoteFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'content' => 'array',
            'color' => NoteColor::class,
            'is_pinned' => 'boolean',
            'sort_order' => 'integer',
            'archived_at' => 'datetime',
            'reminder_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsToMany<Label, $this>
     */
    public function labels(): BelongsToMany
    {
        return $this->belongsToMany(Label::class);
    }

    /**
     * @param  list<int>  $labelIds
     * @param  list<string>  $labelNames
     */
    public function syncLabels(User $user, array $labelIds, array $labelNames = []): void
    {
        $labelIds = $user->labels()->whereIn('id', $labelIds)->pluck('id')->all();

        foreach ($labelNames as $name) {
            $name = trim($name);

            if ($name === '') {
                continue;
            }

            $labelIds[] = $user->labels()->firstOrCreate(['name' => $name])->id;
        }

        $this->labels()->sync(array_values(array_unique($labelIds)));
    }

    /**
     * @param  Builder<Note>  $query
     * @return Builder<Note>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }

    /**
     * @param  Builder<Note>  $query
     * @return Builder<Note>
     */
    public function scopeArchived(Builder $query): Builder
    {
        return $query->whereNotNull('archived_at');
    }

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
    }
}
