<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\NoteAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NoteAttachment>
 */
class NoteAttachmentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->word().'.txt';

        return [
            'note_id' => Note::factory(),
            'original_name' => $name,
            'path' => 'note-attachments/'.$name,
            'mime_type' => 'text/plain',
            'size' => fake()->numberBetween(100, 10_000),
            'disk' => 'local',
        ];
    }
}
