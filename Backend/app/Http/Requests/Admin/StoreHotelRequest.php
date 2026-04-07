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
            'photos.*' => 'image|max:5120', // 5MB max per photo

            // Step 4 - Admin hôtel (création obligatoire)
            'admin_nom' => 'required|string|max:100',
            'admin_prenom' => 'required|string|max:100',
            'admin_email' => 'required|email|unique:users,email',
            'admin_telephone' => 'nullable|string|max:20',

            // Step 5 - Abonnement
            'type_abonnement'      => 'required|in:explore,select,signature',
            'abonnement_date_debut' => 'required|date',
            'abonnement_date_fin'   => 'nullable|date|after:abonnement_date_debut',
        ];
    }

    public function messages(): array
    {
        return [
            'types.required' => 'Veuillez sélectionner au moins un type d\'hôtel.',
            'types.min' => 'Veuillez sélectionner au moins un type d\'hôtel.',
            'destination_id.required' => 'Veuillez sélectionner une destination.',
            'photos.*.max' => 'Chaque photo ne doit pas dépasser 5 Mo.',
            'admin_nom.required' => 'Le nom de l\'administrateur de l\'hôtel est obligatoire.',
            'admin_prenom.required' => 'Le prénom de l\'administrateur de l\'hôtel est obligatoire.',
            'admin_email.required' => 'L\'email de l\'administrateur de l\'hôtel est obligatoire.',
            'admin_email.unique' => 'Cet email est déjà utilisé par un autre utilisateur.',
        ];
    }
}
