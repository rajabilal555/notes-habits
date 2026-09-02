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

    $content = 'Milk and eggs';

    $this->get(route('notes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notes/index')
            ->has('notes', 0),
        );

    $this->post(route('notes.store'), [
        'title' => 'Groceries',
        'content' => $content,
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note)->not->toBeNull()
        ->and($note->user_id)->toBe($user->id)
        ->and($note->title)->toBe('Groceries')
        ->and($note->content)->toBe($content);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.title', 'Groceries'),
        );

    $updatedContent = 'Milk, eggs, bread';

    $this->patch(route('notes.update', $note), [
        'title' => 'Shopping',
        'content' => $updatedContent,
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh())
        ->title->toBe('Shopping')
        ->content->toBe($updatedContent);

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
        'content' => 'Nope',
    ])->assertForbidden();

    $this->delete(route('notes.destroy', $note))
        ->assertForbidden();

    expect($note->fresh()->title)->not->toBe('Hacked');
});
