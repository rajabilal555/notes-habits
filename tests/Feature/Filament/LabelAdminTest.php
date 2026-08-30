<?php

use App\Models\Label;
use App\Models\User;

test('guests cannot access filament admin', function () {
    $this->get('/admin')->assertRedirect(route('login'));
});

test('authenticated users can view their labels in filament', function () {
    $user = User::factory()->create();
    Label::factory()->for($user)->create(['name' => 'Work']);
    Label::factory()->create(['name' => 'Foreign']);

    $this->actingAs($user);

    $this->get('/admin/labels')
        ->assertOk()
        ->assertSee('Work')
        ->assertDontSee('Foreign');
});
