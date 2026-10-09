<?php

namespace App\Http\Requests\Hotel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDisponibiliteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'propriete_id' => 'required|exists:proprietes,id',
            'date' => 'required|date|after_or_equal:today',
            'est_disponible' => 'required|boolean',
            'prix_special' => 'nullable|numeric|min:0',
            'minimum_nuits' => 'nullable|integer|min:1',
        ];
    }
}
