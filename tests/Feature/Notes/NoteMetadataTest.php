<?php

use App\Enums\NoteColor;
use App\Models\Note;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('active notes list pinned notes first', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $olderPinned = Note::factory()->for($user)->create([
        'title' => 'Pinned old',
        'is_pinned' => true,
        'updated_at' => now()->subDay(),
    ]);
    $newerUnpinned = Note::factory()->for($user)->create([
        'title' => 'Recent',
        'is_pinned' => false,
    ]);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 2)
            ->where('notes.0.id', $olderPinned->id)
            ->where('notes.1.id', $newerUnpinned->id),
        );
});

test('archived notes are hidden from the main notes page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $active = Note::factory()->for($user)->create(['title' => 'Active']);
    $archived = Note::factory()->for($user)->archived()->create(['title' => 'Archived']);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.id', $active->id)
            ->missing('notes.1'),
        );

    $this->get(route('notes.archived'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('notes/archived')
            ->has('notes', 1)
            ->where('notes.0.id', $archived->id),
        );
});

test('users can archive and unarchive notes', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create(['title' => 'To archive']);

    $this->patch(route('notes.archive', $note))
        ->assertRedirect(route('notes.index'));

    expect($note->fresh()->archived_at)->not->toBeNull();

    $this->get(route('notes.archived'))
        ->assertInertia(fn (Assert $page) => $page->has('notes', 1));

    $this->patch(route('notes.unarchive', $note))
        ->assertRedirect(route('notes.index'));

    expect($note->fresh()->archived_at)->toBeNull();

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page->has('notes', 1));
});

test('users can update note color and pin state', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create();

    $this->patch(route('notes.update', $note), [
        'title' => $note->title,
        'body' => $note->body,
        'color' => 'mint',
        'is_pinned' => true,
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh())
        ->color->toBe(NoteColor::Mint)
        ->is_pinned->toBeTrue();
});
