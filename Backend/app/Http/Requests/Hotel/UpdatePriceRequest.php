<?php

namespace App\Http\Requests\Hotel;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'prix' => 'required|numeric|min:0',
            'devise' => 'required|size:3',
            'raison' => 'nullable|string|max:255',
        ];
    }
}
