<?php

namespace App\Http\Requests\Admin;

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
            'sujet' => 'nullable|string|max:255',
            'contenu' => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'destinataire_id.required' => 'Veuillez sélectionner un destinataire.',
            'contenu.required' => 'Le message ne peut pas être vide.',
        ];
    }
}
