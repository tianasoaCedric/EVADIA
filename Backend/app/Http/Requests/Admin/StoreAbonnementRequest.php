<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAbonnementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hotel_id' => 'required|exists:hotels,id',
            'type_abonnement' => [
                'required',
                'string',
                Rule::exists('plans', 'code')->where('est_actif', true),
            ],
            'date_debut' => 'required|date',
            'date_fin' => 'nullable|date|after:date_debut',
            'prix_mensuel' => 'required|numeric|min:0',
            'devise' => 'nullable|string|in:MGA,EUR',
        ];
    }

    public function messages(): array
    {
        return [
            'type_abonnement.exists' => 'Choisissez une formule active.',
        ];
    }
}
