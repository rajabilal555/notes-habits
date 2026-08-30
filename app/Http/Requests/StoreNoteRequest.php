<?php

namespace App\Http\Requests;

use App\Enums\NoteColor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNoteRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:10000'],
            'color' => ['nullable', 'string', Rule::in(NoteColor::values())],
            'is_pinned' => ['sometimes', 'boolean'],
            'items' => ['sometimes', 'array'],
            'items.*.id' => ['nullable', 'integer'],
            'items.*.text' => ['nullable', 'string', 'max:500'],
            'items.*.is_checked' => ['sometimes', 'boolean'],
            'items.*.sort_order' => ['sometimes', 'integer', 'min:0'],
            'reminder_at' => ['nullable', 'date'],
            'label_ids' => ['sometimes', 'array'],
            'label_ids.*' => ['integer'],
            'label_names' => ['sometimes', 'array'],
            'label_names.*' => ['string', 'max:50'],
        ];
    }
}
