<?php

use App\Models\Note;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot access notes', function () {
    $this->get(route('notes.index'))->assertRedirect(route('login'));
});

test('authenticated users can create, list, update, and delete notes', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('notes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notes/index')
            ->has('notes', 0),
        );

    $this->post(route('notes.store'), [
        'title' => 'Groceries',
        'body' => 'Milk and eggs',
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note)->not->toBeNull()
        ->and($note->user_id)->toBe($user->id)
        ->and($note->title)->toBe('Groceries')
        ->and($note->body)->toBe('Milk and eggs');

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.title', 'Groceries'),
        );

    $this->patch(route('notes.update', $note), [
        'title' => 'Shopping',
        'body' => 'Milk, eggs, bread',
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh())
        ->title->toBe('Shopping')
        ->body->toBe('Milk, eggs, bread');

    $this->delete(route('notes.destroy', $note))
        ->assertRedirect(route('notes.index'));

    expect(Note::query()->count())->toBe(0);
});

test('users cannot modify another users notes', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $note = Note::factory()->for($owner)->create();

    $this->actingAs($other);

    $this->patch(route('notes.update', $note), [
        'title' => 'Hacked',
        'body' => 'Nope',
    ])->assertForbidden();

    $this->delete(route('notes.destroy', $note))
        ->assertForbidden();

    expect($note->fresh()->title)->not->toBe('Hacked');
});
