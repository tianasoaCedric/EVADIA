<?php

namespace App\Http\Requests\Hotel;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => [
                'required',
                function ($attr, $value, $fail) {
                    if (!Hash::check($value, $this->user()->password_hash)) {
                        $fail('Le mot de passe actuel est incorrect.');
                    }
                }
            ],
            'password' => [
                'required',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/',
                function ($attr, $value, $fail) {
                    if ($value === '0000') {
                        $fail('Vous ne pouvez pas utiliser le mot de passe par défaut.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
        ];
    }
}
