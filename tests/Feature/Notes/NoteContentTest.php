<?php

use App\Models\Note;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('users can create and update notes with blocknote content', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $content = sampleChecklistContent([
        ['text' => 'Milk', 'checked' => false],
        ['text' => 'Eggs', 'checked' => false],
    ]);

    $this->post(route('notes.store'), [
        'title' => 'Groceries',
        'content' => $content,
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note?->content)->toBe($content);

    $this->get(route('notes.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('notes', 1)
            ->where('notes.0.content.0.type', 'checkListItem')
            ->where('notes.0.content.0.content.0.text', 'Milk'),
        );

    $updatedContent = sampleChecklistContent([
        ['text' => 'Milk', 'checked' => true],
        ['text' => 'Bread', 'checked' => false],
    ]);

    $this->patch(route('notes.update', $note), [
        'title' => 'Groceries',
        'content' => $updatedContent,
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh()->content)->toBe($updatedContent);
});

test('users can create and update notes with blocknote table content', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $content = sampleTableContent([
        ['ahey', null],
        [null, null],
    ]);

    $this->post(route('notes.store'), [
        'title' => 'Table note',
        'content' => $content,
    ])->assertRedirect(route('notes.index'));

    $note = Note::query()->first();

    expect($note?->content)->toBe($content);

    $updatedContent = sampleTableContent([
        ['ahey', 'updated'],
        ['row two', null],
    ]);

    $this->patch(route('notes.update', $note), [
        'title' => 'Table note',
        'content' => $updatedContent,
    ])->assertRedirect(route('notes.index'));

    expect($note->fresh()->content)->toBe($updatedContent);
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
 * @param  list<array{text: string, checked: bool}>  $items
 * @return list<array<string, mixed>>
 */
function sampleChecklistContent(array $items): array
{
    return array_map(
        fn (array $item, int $index) => [
            'id' => 'checklist-'.$index,
            'type' => 'checkListItem',
            'props' => [
                'textColor' => 'default',
                'backgroundColor' => 'default',
                'textAlignment' => 'left',
                'checked' => $item['checked'],
            ],
            'content' => [
                [
                    'type' => 'text',
                    'text' => $item['text'],
                    'styles' => [],
                ],
            ],
            'children' => [],
        ],
        $items,
        array_keys($items),
    );
}

/**
 * @param  list<list<string|null>>  $rows
 * @return list<array<string, mixed>>
 */
function sampleTableContent(array $rows): array
{
    return [
        [
            'id' => 'table-1',
            'type' => 'table',
            'props' => [
                'textColor' => 'default',
            ],
            'content' => [
                'type' => 'tableContent',
                'columnWidths' => array_fill(0, count($rows[0] ?? []), null),
                'rows' => array_map(
                    fn (array $cells) => [
                        'cells' => array_map(
                            fn (?string $text) => [
                                'type' => 'tableCell',
                                'content' => $text === null || $text === ''
                                    ? []
                                    : [
                                        [
                                            'type' => 'text',
                                            'text' => $text,
                                            'styles' => [],
                                        ],
                                    ],
                                'props' => [
                                    'colspan' => 1,
                                    'rowspan' => 1,
                                    'backgroundColor' => 'default',
                                    'textColor' => 'default',
                                    'textAlignment' => 'left',
                                ],
                            ],
                            $cells,
                        ),
                    ],
                    $rows,
                ),
            ],
            'children' => [],
        ],
    ];
}
