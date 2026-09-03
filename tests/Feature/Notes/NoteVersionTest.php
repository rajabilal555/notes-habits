<?php

use App\Models\Note;
use App\Models\NoteVersion;
use App\Models\User;

test('creating a note records an initial version', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->post(route('notes.store'), [
        'title' => 'Groceries',
        'content' => 'Milk',
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note)->not->toBeNull()
        ->and($note->versions)->toHaveCount(1)
        ->and($note->versions->first())
        ->title->toBe('Groceries')
        ->content->toBe('Milk');
});

test('updating title or content creates a new version only when changed', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create([
        'title' => 'Draft',
        'content' => 'One',
    ]);
    $note->recordVersionIfChanged();

    expect($note->versions()->count())->toBe(1);

    $this->patch(route('notes.update', $note), [
        'title' => 'Draft',
        'content' => 'One',
    ])->assertRedirect(route('notes.index'));

    expect($note->versions()->count())->toBe(1);

    $this->patch(route('notes.update', $note), [
        'title' => 'Final',
        'content' => 'Two',
    ])->assertRedirect(route('notes.index'));

    expect($note->versions()->count())->toBe(2)
        ->and($note->fresh()->versions()->first())
        ->title->toBe('Final')
        ->content->toBe('Two');
});

test('pin and reminder only updates do not create versions', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create([
        'title' => 'Pinned later',
        'content' => 'Body',
    ]);
    $note->recordVersionIfChanged();

    expect($note->versions()->count())->toBe(1);

    $this->patch(route('notes.update', $note), [
        'is_pinned' => true,
    ])->assertRedirect(route('notes.index'));

    $this->patch(route('notes.update', $note), [
        'reminder_at' => now()->addDay()->toDateTimeString(),
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh())
        ->is_pinned->toBeTrue()
        ->and($note->versions()->count())->toBe(1);
});

test('users can list note versions as json', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create([
        'title' => 'Current',
        'content' => 'Now',
    ]);
    $older = NoteVersion::factory()->for($note)->create([
        'title' => 'Older',
        'content' => 'Then',
        'created_at' => now()->subHour(),
    ]);
    $newer = NoteVersion::factory()->for($note)->create([
        'title' => 'Newer',
        'content' => 'Later',
        'created_at' => now(),
    ]);

    $this->getJson(route('notes.versions.index', $note))
        ->assertOk()
        ->assertJsonCount(2, 'versions')
        ->assertJsonPath('versions.0.id', $newer->id)
        ->assertJsonPath('versions.1.id', $older->id);
});

test('restoring a version snapshots current content then applies the version', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create([
        'title' => 'Current',
        'content' => 'Live text',
    ]);
    $note->recordVersionIfChanged();

    $past = NoteVersion::factory()->for($note)->create([
        'title' => 'Past',
        'content' => 'Old text',
        'created_at' => now()->subMinute(),
    ]);

    // Make live content differ from the latest version snapshot.
    $note->update([
        'title' => 'Unsaved shape',
        'content' => 'Changed since last save',
    ]);

    $this->post(route('notes.versions.restore', [$note, $past]))
        ->assertRedirect();

    $note->refresh();

    expect($note)
        ->title->toBe('Past')
        ->content->toBe('Old text')
        ->and(
            $note->versions()
                ->where('title', 'Unsaved shape')
                ->where('content', 'Changed since last save')
                ->exists(),
        )->toBeTrue();
});

test('users cannot list or restore another users note versions', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $note = Note::factory()->for($owner)->create([
        'title' => 'Secret',
        'content' => 'Private',
    ]);
    $version = NoteVersion::factory()->for($note)->create([
        'title' => 'Secret',
        'content' => 'Private',
    ]);

    $this->actingAs($other);

    $this->getJson(route('notes.versions.index', $note))
        ->assertForbidden();

    $this->post(route('notes.versions.restore', [$note, $version]))
        ->assertForbidden();

    expect($note->fresh())
        ->title->toBe('Secret')
        ->content->toBe('Private');
});
