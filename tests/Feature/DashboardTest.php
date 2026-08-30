<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->where('name', 'N&H')
        ->has('dueToday')
        ->has('habits'),
    );
});

test('guests cannot visit notes or habits', function () {
    $this->get(route('notes.index'))->assertRedirect(route('login'));
    $this->get(route('habits.index'))->assertRedirect(route('login'));
});

test('authenticated users can visit notes and habits', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('notes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('notes/index'));

    $this->get(route('habits.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('habits/index'));
});
