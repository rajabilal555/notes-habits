<?php

use App\Models\Label;
use App\Models\Note;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('users can attach existing and new labels to notes', function () {
    $user = User::factory()->create();
    $work = Label::factory()->for($user)->create(['name' => 'Work']);
    $this->actingAs($user);

    $this->post(route('notes.store'), [
        'title' => 'Project brief',
        'label_ids' => [$work->id],
        'label_names' => ['Personal'],
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note->labels()->pluck('name')->sort()->values()->all())
        ->toBe(['Personal', 'Work']);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('labels', 2)
            ->where('notes.0.labels', fn ($labels) => collect($labels)
                ->pluck('name')
                ->sort()
                ->values()
                ->all() === ['Personal', 'Work']),
        );
});

test('users can filter notes by label', function () {
    $user = User::factory()->create();
    $work = Label::factory()->for($user)->create(['name' => 'Work']);
    $home = Label::factory()->for($user)->create(['name' => 'Home']);
    $workNote = Note::factory()->for($user)->create(['title' => 'Work note']);
    $homeNote = Note::factory()->for($user)->create(['title' => 'Home note']);
    $workNote->labels()->attach($work);
    $homeNote->labels()->attach($home);

    $this->actingAs($user);

    $this->get(route('notes.index', ['label' => $work->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.title', 'Work note')
            ->where('selectedLabelId', $work->id),
        );
});

test('users cannot attach another users labels', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $foreignLabel = Label::factory()->for($other)->create();

    $this->actingAs($owner);

    $this->post(route('notes.store'), [
        'title' => 'Note',
        'label_ids' => [$foreignLabel->id],
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note->labels)->toHaveCount(0);
});
