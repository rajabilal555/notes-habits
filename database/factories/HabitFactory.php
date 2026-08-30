<?php

namespace Database\Factories;

use App\Enums\HabitCadence;
use App\Models\Habit;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Habit>
 */
class HabitFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'cadence' => HabitCadence::Daily,
            'weekdays_mask' => 0,
        ];
    }

    /**
     * @param  list<int>  $weekdays
     */
    public function onWeekdays(array $weekdays): static
    {
        return $this->state(fn (array $attributes) => [
            'cadence' => HabitCadence::Weekdays,
            'weekdays_mask' => Habit::maskFromWeekdays($weekdays),
        ]);
    }
}
