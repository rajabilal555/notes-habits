<?php

use App\Models\Label;
use App\Models\Note;
use App\Models\User;

test('users can delete their own labels', function () {
    $user = User::factory()->create();
    $label = Label::factory()->for($user)->create(['name' => 'Work']);
    $note = Note::factory()->for($user)->create();
    $note->labels()->attach($label);

    $this->actingAs($user);

    $this->delete(route('labels.destroy', $label))
        ->assertRedirect();

    expect(Label::query()->find($label->id))->toBeNull()
        ->and($note->fresh()->labels)->toHaveCount(0);
});

test('users cannot delete another users labels', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $label = Label::factory()->for($owner)->create();

    $this->actingAs($other);

    $this->delete(route('labels.destroy', $label))
        ->assertForbidden();

    expect(Label::query()->find($label->id))->not->toBeNull();
});
