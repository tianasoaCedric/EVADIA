<?php

namespace App\Http\Requests\Hotel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|max:200',
            'description' => 'nullable|string',
            'type_propriete' => 'required|in:chambre,suite,villa,appartement,bungalow,studio',
            'capacite' => 'required|integer|min:1',
            'nb_chambres' => 'nullable|integer|min:0',
            'nb_lits' => 'nullable|integer|min:0',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|integer|min:1',
            'equipements' => 'nullable|array',
        ];
    }
}
