<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\NoteItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NoteItem>
 */
class NoteItemFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'note_id' => Note::factory(),
            'text' => fake()->sentence(3),
            'is_checked' => false,
            'sort_order' => 0,
        ];
    }

    public function checked(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_checked' => true,
        ]);
    }
}
