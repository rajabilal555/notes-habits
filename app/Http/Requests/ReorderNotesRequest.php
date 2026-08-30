<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReorderNotesRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'note_ids' => ['required', 'array', 'min:1'],
            'note_ids.*' => [
                'integer',
                Rule::exists('notes', 'id')->where(fn ($query) => $query
                    ->where('user_id', $this->user()?->id)
                    ->whereNull('archived_at')),
            ],
        ];
    }
}
