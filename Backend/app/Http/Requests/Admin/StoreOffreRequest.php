<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreOffreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:200',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'code_promo' => 'nullable|string|max:50|unique:offres,code_promo',
            'statut' => 'nullable|string|in:active,inactive,brouillon',

            'avantages' => 'required|array|min:1',
            'avantages.*.type_avantage_id' => 'required|exists:types_avantages,id',
            'avantages.*.valeur' => 'required|string',
            'avantages.*.quantite_max' => 'nullable|integer|min:1',
            'avantages.*.applications' => 'nullable|array',
            'avantages.*.applications.*.entite_type' => 'required_with:avantages.*.applications|in:hotel,propriete,service',
            'avantages.*.applications.*.entite_id' => 'required_with:avantages.*.applications|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'avantages.required' => 'Veuillez ajouter au moins un avantage.',
            'code_promo.unique' => 'Ce code promo est déjà utilisé.',
        ];
    }
}
