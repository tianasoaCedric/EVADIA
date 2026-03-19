<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class ProfileController extends Controller
{
    #[OA\Get(
        path: '/api/client/profile',
        summary: 'Mon profil',
        description: 'Retourne les informations du profil client avec préférences.',
        tags: ['Client - Profil'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Profil du client',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 10),
                            new OA\Property(property: 'nom', type: 'string', example: 'Leclerc'),
                            new OA\Property(property: 'prenom', type: 'string', example: 'Marie'),
                            new OA\Property(property: 'email', type: 'string', example: 'marie@test.com'),
                            new OA\Property(property: 'telephone', type: 'string', nullable: true),
                            new OA\Property(property: 'avatar_url', type: 'string', nullable: true),
                            new OA\Property(property: 'devise_preferee', type: 'string', example: 'EUR'),
                            new OA\Property(property: 'langue_preferee', type: 'string', nullable: true, example: 'fr'),
                            new OA\Property(property: 'date_inscription', type: 'string', format: 'date-time'),
                        ]),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function show(): JsonResponse
    {
        return response()->json(['data' => auth()->user()->load('profilClient')]);
    }

    #[OA\Put(
        path: '/api/client/profile',
        summary: 'Modifier mon profil',
        tags: ['Client - Profil'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'nom', type: 'string', example: 'Leclerc'),
                    new OA\Property(property: 'prenom', type: 'string', example: 'Marie'),
                    new OA\Property(property: 'telephone', type: 'string', nullable: true, example: '+33612345678'),
                    new OA\Property(property: 'devise_preferee', type: 'string', example: 'EUR'),
                    new OA\Property(property: 'langue_preferee', type: 'string', nullable: true, example: 'fr'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Profil mis à jour', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Profil mis à jour.'),
                    new OA\Property(property: 'data', type: 'object'),
                ]
            )),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'telephone' => 'nullable|string|max:20',
            'devise_preferee' => 'nullable|string|max:10',
            'langue_preferee' => 'nullable|string|max:10',
        ]);

        auth()->user()->update($validated);

        return response()->json(['message' => 'Profil mis à jour.', 'data' => auth()->user()]);
    }

    #[OA\Put(
        path: '/api/client/profile/password',
        summary: 'Changer mon mot de passe',
        tags: ['Client - Profil'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['current_password', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'current_password', type: 'string', example: 'ancien_mdp'),
                    new OA\Property(property: 'password', type: 'string', minLength: 8, example: 'nouveau_mdp123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'nouveau_mdp123'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Mot de passe mis à jour'),
            new OA\Response(response: 422, description: 'Mot de passe actuel incorrect ou validation échouée'),
        ]
    )]
    public function updatePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json([
                'message' => 'Le mot de passe actuel est incorrect.',
                'errors' => ['current_password' => ['Le mot de passe actuel est incorrect.']],
            ], 422);
        }

        $user->update(['password_hash' => $request->password]);

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }
}
