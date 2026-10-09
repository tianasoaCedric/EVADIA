<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHotelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => 'required|string|max:200',
            'description' => 'nullable|string',
            'email_contact' => 'nullable|email|max:255',
            'telephone' => 'nullable|string|max:20',
            'site_web' => 'nullable|url|max:255',
            'etoiles' => 'nullable|integer|min:1|max:5',
            'devise_principale' => 'nullable|string|max:3',
            'types' => 'required|array|min:1',
            'types.*' => 'exists:types_hotels,id',

            // Address
            'adresse_ligne1' => 'required|string|max:255',
            'adresse_ligne2' => 'nullable|string|max:255',
            'code_postal' => 'required|string|max:20',
            'ville' => 'required|string|max:100',
            'pays' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'destination_id' => 'required|exists:destinations,id',
        ];
    }
}
