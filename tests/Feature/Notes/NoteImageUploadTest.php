<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('authenticated users can upload note images', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson(route('notes.images.store'), [
        'image' => UploadedFile::fake()->image('photo.jpg'),
    ]);

    $response
        ->assertOk()
        ->assertJsonStructure(['url']);

    expect($response->json('url'))->toBeString();

    Storage::disk('public')->assertExists(
        'notes/'.$user->id.'/'.basename(parse_url($response->json('url'), PHP_URL_PATH)),
    );
});

test('guests cannot upload note images', function () {
    $this->postJson(route('notes.images.store'), [
        'image' => UploadedFile::fake()->image('photo.jpg'),
    ])->assertUnauthorized();
});

test('note image uploads reject invalid files', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $this->actingAs($user);

    $this->postJson(route('notes.images.store'), [
        'image' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
    ])->assertUnprocessable();
});
