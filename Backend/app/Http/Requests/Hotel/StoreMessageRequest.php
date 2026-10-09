<?php

namespace App\Http\Requests\Hotel;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'destinataire_id' => 'required|exists:users,id',
            'sujet' => 'required|string|max:255',
            'contenu' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'contenu.required' => 'Le contenu du message est obligatoire.',
            'sujet.required' => 'Le sujet du message est obligatoire.',
        ];
    }
}
