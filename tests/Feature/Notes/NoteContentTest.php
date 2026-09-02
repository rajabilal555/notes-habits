<?php

use App\Models\Note;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('users can create and update notes with markdown content', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $content = "- [ ] Buy milk\n- [x] Eggs";

    $this->post(route('notes.store'), [
        'title' => 'Groceries',
        'content' => $content,
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note?->content)->toBe($content);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.content', $content),
        );

    $updatedContent = '- [ ] Buy bread';

    $this->patch(route('notes.update', $note), [
        'title' => 'Groceries',
        'content' => $updatedContent,
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh()->content)->toBe($updatedContent);
});

test('users can create and update notes with blockquote markdown', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $content = '> Stay hungry, stay foolish.';

    $this->post(route('notes.store'), [
        'title' => 'Quote',
        'content' => $content,
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note?->content)->toBe($content);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.content', $content),
        );
});

test('legacy json note content is returned as a raw string', function () {
    $user = User::factory()->create();
    $legacyContent = '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Old note"}]}]}';

    $note = Note::factory()->for($user)->create([
        'content' => $legacyContent,
    ]);

    $this->actingAs($user);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.content', $legacyContent),
        );
});

test('notes can be created without content', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('notes.store'), [
        'title' => 'Empty',
    ])->assertRedirect(route('notes.index'));

    expect(Note::query()->first())
        ->title->toBe('Empty')
        ->content->toBeNull();
});
