<?php

namespace App\Http\Requests;

use App\Enums\HabitCadence;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateHabitRequest extends FormRequest
{
    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'cadence' => ['required', 'string', Rule::in(array_column(HabitCadence::cases(), 'value'))],
            'weekdays' => ['required_if:cadence,weekdays', 'array'],
            'weekdays.*' => ['integer', 'between:0,6'],
        ];
    }
}
