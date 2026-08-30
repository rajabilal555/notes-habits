<?php

namespace Database\Factories;

use App\Models\Habit;
use App\Models\HabitCompletion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HabitCompletion>
 */
class HabitCompletionFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'habit_id' => Habit::factory(),
            'completed_date' => today(),
        ];
    }
}
