<?php

use App\Models\Habit;
use App\Models\HabitCompletion;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('users can create, update, toggle, and delete habits', function () {
    Carbon::setTestNow('2026-08-30 09:00:00');

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('habits.store'), [
        'name' => 'Read',
        'cadence' => 'daily',
    ])->assertRedirect(route('habits.index'));

    $habit = Habit::query()->first();

    expect($habit->name)->toBe('Read');

    $this->from(route('habits.index'))
        ->patch(route('habits.update', $habit), [
            'name' => 'Read 20 pages',
            'description' => 'Twenty pages before bed.',
            'cadence' => 'weekdays',
            'weekdays' => [1, 3, 5],
        ])
        ->assertRedirect(route('habits.index'));

    expect($habit->fresh())
        ->name->toBe('Read 20 pages')
        ->description->toBe('Twenty pages before bed.');

    $this->patch(route('habits.toggle', $habit))
        ->assertRedirect();

    expect(HabitCompletion::query()->count())->toBe(1);

    $this->patch(route('habits.toggle', $habit))
        ->assertRedirect();

    expect(HabitCompletion::query()->count())->toBe(0);

    $this->from(route('habits.index'))
        ->delete(route('habits.destroy', $habit))
        ->assertRedirect(route('habits.index'));

    expect(Habit::query()->count())->toBe(0);
});

test('habits index includes streak and heatmap payload', function () {
    Carbon::setTestNow('2026-08-30 09:00:00');

    $user = User::factory()->create();
    $habit = Habit::factory()->for($user)->create(['name' => 'Meditate']);
    HabitCompletion::factory()->for($habit)->create([
        'completed_date' => today(),
    ]);

    $this->actingAs($user);

    $this->get(route('habits.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('habits', 1)
            ->where('habits.0.name', 'Meditate')
            ->where('habits.0.streak', 1)
            ->where('habits.0.completed_today', true)
            ->has('habits.0.heatmap', 2)
            ->has('habits.0.history_heatmap', 12),
        );
});

test('users cannot modify another users habits', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $habit = Habit::factory()->for($owner)->create();

    $this->actingAs($other);

    $this->patch(route('habits.update', $habit), [
        'name' => 'Hacked',
        'cadence' => 'daily',
    ])->assertForbidden();

    $this->delete(route('habits.destroy', $habit))
        ->assertForbidden();
});

test('habit glance heatmap spans two weeks', function () {
    Carbon::setTestNow('2026-08-30 09:00:00');

    $habit = Habit::factory()->create();

    $heatmap = $habit->heatmapWeeks(Habit::HEATMAP_GLANCE_WEEKS);

    expect($heatmap)->toHaveCount(Habit::HEATMAP_GLANCE_WEEKS)
        ->and($heatmap[0])->toHaveCount(7)
        ->and($heatmap[1][6]['future'])->toBeTrue()
        ->and($heatmap[0][0]['date'])->toBe('2026-08-23')
        ->and($heatmap[1][6]['date'])->toBe('2026-09-05');
});

test('habit history heatmap spans twelve weeks', function () {
    Carbon::setTestNow('2026-08-30 09:00:00');

    $habit = Habit::factory()->create();

    $heatmap = $habit->heatmapWeeks(Habit::HEATMAP_HISTORY_WEEKS);

    expect($heatmap)->toHaveCount(Habit::HEATMAP_HISTORY_WEEKS)
        ->and($heatmap[11][6]['future'])->toBeTrue();
});

test('users can toggle completion for a specific past date', function () {
    Carbon::setTestNow('2026-08-30 09:00:00');

    $user = User::factory()->create();
    $habit = Habit::factory()->for($user)->create();

    $this->actingAs($user);

    $this->patch(route('habits.toggle', $habit), [
        'date' => '2026-08-29',
    ])->assertRedirect();

    expect(HabitCompletion::query()->whereDate('completed_date', '2026-08-29')->exists())->toBeTrue();

    $this->patch(route('habits.toggle', $habit), [
        'date' => '2026-08-29',
    ])->assertRedirect();

    expect(HabitCompletion::query()->whereDate('completed_date', '2026-08-29')->exists())->toBeFalse();
});

test('users cannot toggle completion for future dates', function () {
    Carbon::setTestNow('2026-08-30 09:00:00');

    $user = User::factory()->create();
    $habit = Habit::factory()->for($user)->create();

    $this->actingAs($user);

    $this->patch(route('habits.toggle', $habit), [
        'date' => '2026-08-31',
    ])->assertSessionHasErrors('date');
});

test('weekday habits skip unscheduled days in streak', function () {
    Carbon::setTestNow('2026-08-31 09:00:00'); // Monday

    $habit = Habit::factory()->onWeekdays([1])->create(); // Monday only
    HabitCompletion::factory()->for($habit)->create([
        'completed_date' => '2026-08-31',
    ]);

    expect($habit->currentStreak())->toBe(1);
});
