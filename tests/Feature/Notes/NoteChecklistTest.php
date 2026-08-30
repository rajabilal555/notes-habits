<?php

use App\Models\Note;
use App\Models\NoteItem;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('users can create and update notes with checklist items', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('notes.store'), [
        'title' => 'Groceries',
        'items' => [
            ['text' => 'Milk', 'is_checked' => false, 'sort_order' => 0],
            ['text' => 'Eggs', 'is_checked' => true, 'sort_order' => 1],
        ],
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note)->not->toBeNull();
    expect($note->items)->toHaveCount(2);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->has('notes.0.items', 2)
            ->where('notes.0.items.0.text', 'Milk'),
        );

    $this->patch(route('notes.update', $note), [
        'title' => 'Groceries',
        'items' => [
            ['id' => $note->items[0]->id, 'text' => 'Milk', 'is_checked' => true, 'sort_order' => 0],
            ['id' => $note->items[1]->id, 'text' => 'Bread', 'is_checked' => false, 'sort_order' => 1],
        ],
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh()->items)->toHaveCount(2)
        ->and($note->items[0]->fresh()->is_checked)->toBeTrue()
        ->and($note->items[1]->fresh()->text)->toBe('Bread');
});

test('users can toggle checklist items from the card endpoint', function () {
    $user = User::factory()->create();
    $note = Note::factory()->for($user)->create();
    $item = NoteItem::factory()->for($note)->create(['text' => 'Water plants']);

    $this->actingAs($user)
        ->patch(route('notes.items.update', [$note, $item]), [
            'is_checked' => true,
        ])
        ->assertRedirect();

    expect($item->fresh()->is_checked)->toBeTrue();
});

test('users cannot toggle items on another users note', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $note = Note::factory()->for($owner)->create();
    $item = NoteItem::factory()->for($note)->create();

    $this->actingAs($other)
        ->patch(route('notes.items.update', [$note, $item]), [
            'is_checked' => true,
        ])
        ->assertForbidden();
});

test('checklist progress is included on note list payloads', function () {
    $user = User::factory()->create();
    $note = Note::factory()->for($user)->create(['title' => 'Tasks']);
    NoteItem::factory()->for($note)->checked()->create(['text' => 'Done', 'sort_order' => 0]);
    NoteItem::factory()->for($note)->create(['text' => 'Todo', 'sort_order' => 1]);

    $this->actingAs($user)
        ->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notes.0.items.0.is_checked', true)
            ->where('notes.0.items.1.is_checked', false),
        );
});
