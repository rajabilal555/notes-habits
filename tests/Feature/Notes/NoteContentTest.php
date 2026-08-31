<?php

use App\Models\Note;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('users can create and update notes with tiptap content', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $content = sampleParagraphContent('Buy milk');

    $this->post(route('notes.store'), [
        'title' => 'Groceries',
        'content' => $content,
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note?->content)->toBe($content);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.content.type', 'doc')
            ->where('notes.0.content.content.0.type', 'paragraph')
            ->where('notes.0.content.content.0.content.0.text', 'Buy milk'),
        );

    $updatedContent = sampleParagraphContent('Buy bread');

    $this->patch(route('notes.update', $note), [
        'title' => 'Groceries',
        'content' => $updatedContent,
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh()->content)->toBe($updatedContent);
});

test('users can create and update notes with blockquote content', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $content = sampleBlockquoteContent('Stay hungry, stay foolish.');

    $this->post(route('notes.store'), [
        'title' => 'Quote',
        'content' => $content,
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note?->content)->toBe($content);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.content.content.0.type', 'blockquote')
            ->where('notes.0.content.content.0.content.0.type', 'paragraph')
            ->where('notes.0.content.content.0.content.0.content.0.text', 'Stay hungry, stay foolish.'),
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

/**
 * @return array<string, mixed>
 */
function sampleParagraphContent(string $text): array
{
    return [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'paragraph',
                'content' => [
                    ['type' => 'text', 'text' => $text],
                ],
            ],
        ],
    ];
}

/**
 * @return array<string, mixed>
 */
function sampleBlockquoteContent(string $text): array
{
    return [
        'type' => 'doc',
        'content' => [
            [
                'type' => 'blockquote',
                'content' => [
                    [
                        'type' => 'paragraph',
                        'content' => [
                            ['type' => 'text', 'text' => $text],
                        ],
                    ],
                ],
            ],
        ],
    ];
}
