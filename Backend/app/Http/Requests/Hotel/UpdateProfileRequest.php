<?php

namespace App\Http\Requests\Hotel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|max:100',
            'prenom' => 'required|max:100',
            'telephone' => 'nullable|max:20',
            'avatar' => 'nullable|image|max:2048',
        ];
    }
}
