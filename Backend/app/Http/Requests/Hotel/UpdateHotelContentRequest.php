<?php

namespace App\Http\Requests\Hotel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHotelContentRequest extends FormRequest
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
            'email_contact' => 'nullable|email|max:255',
            'telephone' => 'nullable|max:20',
            'site_web' => 'nullable|url|max:255',
            'etoiles' => 'nullable|integer|min:1|max:5',
            'types' => 'required|array|min:1',
            'types.*' => 'exists:types_hotels,id',
            'adresse_ligne1' => 'required|max:255',
            'adresse_ligne2' => 'nullable|max:255',
            'code_postal' => 'required|max:20',
            'ville' => 'required|max:100',
            'pays' => 'required|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ];
    }
}
