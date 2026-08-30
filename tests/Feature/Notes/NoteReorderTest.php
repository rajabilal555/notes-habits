<?php

use App\Models\Note;
use App\Models\User;

test('users can reorder their active notes', function () {
    $user = User::factory()->create();
    $first = Note::factory()->for($user)->create(['title' => 'First', 'sort_order' => 0]);
    $second = Note::factory()->for($user)->create(['title' => 'Second', 'sort_order' => 1]);
    $third = Note::factory()->for($user)->create(['title' => 'Third', 'sort_order' => 2]);

    $this->actingAs($user);

    $this->patch(route('notes.reorder'), [
        'note_ids' => [$third->id, $first->id, $second->id],
    ])->assertRedirect();

    expect($third->fresh()->sort_order)->toBe(0)
        ->and($first->fresh()->sort_order)->toBe(1)
        ->and($second->fresh()->sort_order)->toBe(2);
});

test('users cannot reorder another users notes', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $note = Note::factory()->for($owner)->create();

    $this->actingAs($other);

    $this->patch(route('notes.reorder'), [
        'note_ids' => [$note->id],
    ])->assertSessionHasErrors('note_ids.0');
});

test('notes index lists notes by pin status then sort order', function () {
    $user = User::factory()->create();
    Note::factory()->for($user)->create(['title' => 'Later', 'sort_order' => 2]);
    Note::factory()->for($user)->pinned()->create(['title' => 'Pinned', 'sort_order' => 1]);
    Note::factory()->for($user)->create(['title' => 'Soon', 'sort_order' => 0]);

    $this->actingAs($user);

    $this->get(route('notes.index'))
        ->assertInertia(fn ($page) => $page
            ->has('notes', 3)
            ->where('notes.0.title', 'Pinned')
            ->where('notes.1.title', 'Soon')
            ->where('notes.2.title', 'Later'),
        );
});
