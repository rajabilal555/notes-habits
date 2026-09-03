<?php

use App\Models\Note;
use App\Models\NoteAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('users can upload list and download note attachments', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create();
    $file = UploadedFile::fake()->create('brief.pdf', 200, 'application/pdf');

    $this->postJson(route('notes.attachments.store', $note), [
        'file' => $file,
    ])
        ->assertCreated()
        ->assertJsonPath('attachment.original_name', 'brief.pdf')
        ->assertJsonPath('attachment.is_image', false);

    $attachment = NoteAttachment::query()->first();

    expect($attachment)->not->toBeNull()
        ->and(Storage::disk('local')->exists($attachment->path))->toBeTrue()
        ->and($attachment->markdownSnippet())->toContain('[brief.pdf](')
        ->and($attachment->markdownSnippet())->toContain(route('notes.attachments.show', [$note, $attachment]));

    $this->getJson(route('notes.attachments.index', $note))
        ->assertOk()
        ->assertJsonCount(1, 'attachments')
        ->assertJsonPath('attachments.0.id', $attachment->id);

    $this->get(route('notes.attachments.show', [$note, $attachment]))
        ->assertOk();
});

test('image attachments produce image markdown snippets', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create();
    $file = UploadedFile::fake()->image('shot.png');

    $this->postJson(route('notes.attachments.store', $note), [
        'file' => $file,
    ])->assertCreated();

    $attachment = NoteAttachment::query()->first();

    expect($attachment->isImage())->toBeTrue()
        ->and($attachment->markdownSnippet())->toStartWith('![shot.png](');
});

test('users can delete attachments and files are removed', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create();
    $file = UploadedFile::fake()->create('notes.txt', 10, 'text/plain');

    $this->postJson(route('notes.attachments.store', $note), [
        'file' => $file,
    ])->assertCreated();

    $attachment = NoteAttachment::query()->first();
    $path = $attachment->path;

    $this->deleteJson(route('notes.attachments.destroy', [$note, $attachment]))
        ->assertOk()
        ->assertJson(['ok' => true]);

    expect(NoteAttachment::query()->count())->toBe(0)
        ->and(Storage::disk('local')->exists($path))->toBeFalse();
});

test('deleting a note removes its attachment files', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create();

    $this->postJson(route('notes.attachments.store', $note), [
        'file' => UploadedFile::fake()->create('keep.txt', 5, 'text/plain'),
    ])->assertCreated();

    $path = NoteAttachment::query()->first()->path;

    $this->delete(route('notes.destroy', $note))
        ->assertRedirect(route('notes.index'));

    expect(Note::query()->count())->toBe(0)
        ->and(NoteAttachment::query()->count())->toBe(0)
        ->and(Storage::disk('local')->exists($path))->toBeFalse();
});

test('users cannot access another users note attachments', function () {
    Storage::fake('local');

    $owner = User::factory()->create();
    $other = User::factory()->create();
    $note = Note::factory()->for($owner)->create();

    $this->actingAs($owner);
    $this->postJson(route('notes.attachments.store', $note), [
        'file' => UploadedFile::fake()->create('secret.bin', 5, 'application/octet-stream'),
    ])->assertCreated();

    $attachment = NoteAttachment::query()->first();

    $this->actingAs($other);

    $this->getJson(route('notes.attachments.index', $note))->assertForbidden();
    $this->get(route('notes.attachments.show', [$note, $attachment]))->assertForbidden();
    $this->postJson(route('notes.attachments.store', $note), [
        'file' => UploadedFile::fake()->create('hack.txt', 5, 'text/plain'),
    ])->assertForbidden();
    $this->deleteJson(route('notes.attachments.destroy', [$note, $attachment]))->assertForbidden();
});

test('attachment upload rejects files over twenty megabytes', function () {
    Storage::fake('local');

    $user = User::factory()->create();
    $this->actingAs($user);

    $note = Note::factory()->for($user)->create();
    $file = UploadedFile::fake()->create('huge.bin', 21 * 1024, 'application/octet-stream');

    $this->postJson(route('notes.attachments.store', $note), [
        'file' => $file,
    ])->assertUnprocessable();
});
