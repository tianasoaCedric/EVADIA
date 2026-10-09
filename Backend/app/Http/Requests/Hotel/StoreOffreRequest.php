<?php

namespace App\Http\Requests\Hotel;

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
            'titre' => 'required|max:200',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'code_promo' => 'nullable|string|max:50|unique:offres,code_promo',
            'avantages' => 'required|array|min:1',
            'avantages.*.type_avantage_id' => 'required|exists:types_avantages,id',
            'avantages.*.valeur' => 'required|string',
            'avantages.*.entite_type' => 'required|in:hotel,propriete,service',
            'avantages.*.entite_id' => 'required|integer',
        ];
    }
}
