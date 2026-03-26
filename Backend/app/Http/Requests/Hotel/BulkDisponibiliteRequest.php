<?php

namespace App\Http\Requests\Hotel;

use Illuminate\Foundation\Http\FormRequest;

class BulkDisponibiliteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'propriete_id' => 'required|exists:proprietes,id',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after:date_debut',
            'est_disponible' => 'required|boolean',
            'prix_special' => 'nullable|numeric|min:0',
            'minimum_nuits' => 'nullable|integer|min:1',
        ];
    }
}
