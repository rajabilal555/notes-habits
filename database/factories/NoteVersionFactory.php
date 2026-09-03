<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\NoteVersion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NoteVersion>
 */
class NoteVersionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'note_id' => Note::factory(),
            'title' => fake()->optional()->sentence(),
            'content' => fake()->optional()->paragraph(),
            'created_at' => now(),
        ];
    }
}
