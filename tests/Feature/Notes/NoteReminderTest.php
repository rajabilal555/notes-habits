<?php

use App\Models\Note;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

test('users can set and clear note reminders', function () {
    Carbon::setTestNow('2026-08-30 09:00:00');

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('notes.store'), [
        'title' => 'Call dentist',
        'reminder_at' => '2026-08-30 14:30:00',
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note->reminder_at?->format('Y-m-d H:i:s'))->toBe('2026-08-30 14:30:00');

    $this->patch(route('notes.update', $note), [
        'title' => 'Call dentist',
        'reminder_at' => null,
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh()->reminder_at)->toBeNull();
});

test('dashboard lists notes due today ordered by reminder time', function () {
    Carbon::setTestNow('2026-08-30 09:00:00');

    $user = User::factory()->create();
    Note::factory()->for($user)->create([
        'title' => 'Later',
        'reminder_at' => '2026-08-30 16:00:00',
    ]);
    Note::factory()->for($user)->create([
        'title' => 'Soon',
        'reminder_at' => '2026-08-30 10:00:00',
    ]);
    Note::factory()->for($user)->create([
        'title' => 'Tomorrow',
        'reminder_at' => '2026-08-31 10:00:00',
    ]);

    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('dueToday', 2)
            ->where('dueToday.0.title', 'Soon')
            ->where('dueToday.1.title', 'Later'),
        );
});
