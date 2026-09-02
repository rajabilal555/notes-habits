<?php

namespace App\Http\Requests;

use App\Enums\NoteColor;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNoteRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'color' => ['nullable', 'string', Rule::in(NoteColor::values())],
            'is_pinned' => ['sometimes', 'boolean'],
            'reminder_at' => ['nullable', 'date'],
            'label_ids' => ['sometimes', 'array'],
            'label_ids.*' => ['integer'],
            'label_names' => ['sometimes', 'array'],
            'label_names.*' => ['string', 'max:50'],
        ];
    }
}
