<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreHotelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Step 1 - General info
            'nom' => 'required|string|max:200',
            'description' => 'nullable|string',
            'email_contact' => 'nullable|email|max:255',
            'telephone' => 'nullable|string|max:20',
            'site_web' => 'nullable|url|max:255',
            'etoiles' => 'nullable|integer|min:1|max:5',
            'devise_principale' => 'nullable|string|max:3',
            'types' => 'required|array|min:1',
            'types.*' => 'exists:types_hotels,id',

            // Step 2 - Address
            'adresse_ligne1' => 'required|string|max:255',
            'adresse_ligne2' => 'nullable|string|max:255',
            'code_postal' => 'required|string|max:20',
            'ville' => 'required|string|max:100',
            'pays' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'destination_id' => 'required|exists:destinations,id',

            // Step 3 - Photos
            'photos' => 'nullable|array',
            'photos.*' => 'image|max:5120',

            // Step 4 - Admin
            'admin_user_id' => 'required_without:new_admin|nullable|exists:users,id',
            'new_admin' => 'required_without:admin_user_id|nullable|array',
            'new_admin.nom' => 'required_with:new_admin|string|max:100',
            'new_admin.prenom' => 'required_with:new_admin|string|max:100',
            'new_admin.email' => 'required_with:new_admin|email|unique:users,email',
            'new_admin.telephone' => 'nullable|string|max:20',
        ];
    }

    public function messages(): array
    {
        return [
            'types.required' => 'Veuillez sélectionner au moins un type d\'hôtel.',
            'destination_id.required' => 'Veuillez sélectionner une destination.',
            'photos.*.max' => 'Chaque photo ne doit pas dépasser 5 Mo.',
        ];
    }
}
