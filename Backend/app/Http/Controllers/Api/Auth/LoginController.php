<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class LoginController extends Controller
{
    #[OA\Post(
        path: '/api/auth/login',
        summary: 'Connexion',
        description: 'Authentifie un utilisateur et retourne un token Bearer',
        tags: ['Authentification'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'cedric@test.com'),
                    new OA\Property(property: 'password', type: 'string', example: 'password123'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Connexion reussie',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'user', type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
                                new OA\Property(property: 'prenom', type: 'string', example: 'Cedric'),
                                new OA\Property(property: 'email', type: 'string', example: 'cedric@test.com'),
                                new OA\Property(property: 'est_actif', type: 'boolean', example: true),
                                new OA\Property(property: 'roles', type: 'array',
                                    items: new OA\Items(type: 'object',
                                        properties: [
                                            new OA\Property(property: 'id', type: 'integer', example: 4),
                                            new OA\Property(property: 'code', type: 'string', example: 'clients'),
                                            new OA\Property(property: 'nom', type: 'string', example: 'Client'),
                                            new OA\Property(property: 'niveau', type: 'integer', example: 4),
                                        ]
                                    )
                                ),
                            ]
                        ),
                        new OA\Property(property: 'token', type: 'string', example: '1|evadia_abc123...'),
                        new OA\Property(property: 'token_type', type: 'string', example: 'Bearer'),
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: 'Identifiants incorrects',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Les identifiants sont incorrects.'),
                        new OA\Property(property: 'errors', type: 'object'),
                    ]
                )
            ),
            new OA\Response(response: 429, description: 'Trop de tentatives (rate limit)'),
        ]
    )]
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('roles')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if (!$user->est_actif) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte est désactivé.'],
            ]);
        }

        $user->update(['derniere_connexion' => now()]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    #[OA\Post(
        path: '/api/auth/logout',
        summary: 'Deconnexion',
        description: 'Revoque le token courant',
        tags: ['Authentification'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Deconnexion reussie',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Deconnexion reussie.'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifie'),
        ]
    )]
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    #[OA\Post(
        path: '/api/auth/logout-all',
        summary: 'Deconnexion de toutes les sessions',
        description: 'Revoque tous les tokens de l\'utilisateur',
        tags: ['Authentification'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Toutes les sessions fermees',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Toutes les sessions ont ete fermees.'),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifie'),
        ]
    )]
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Toutes les sessions ont été fermées.']);
    }

    #[OA\Get(
        path: '/api/auth/me',
        summary: 'Profil utilisateur',
        description: 'Retourne les informations de l\'utilisateur connecte avec ses roles',
        tags: ['Authentification'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Profil utilisateur',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'user', type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
                                new OA\Property(property: 'prenom', type: 'string', example: 'Cedric'),
                                new OA\Property(property: 'email', type: 'string', example: 'cedric@test.com'),
                                new OA\Property(property: 'telephone', type: 'string', example: '+33612345678', nullable: true),
                                new OA\Property(property: 'avatar_url', type: 'string', nullable: true),
                                new OA\Property(property: 'email_verified', type: 'boolean', example: false),
                                new OA\Property(property: 'two_factor_enabled', type: 'boolean', example: false),
                                new OA\Property(property: 'est_actif', type: 'boolean', example: true),
                                new OA\Property(property: 'devise_preferee', type: 'string', example: 'EUR'),
                                new OA\Property(property: 'derniere_connexion', type: 'string', format: 'date-time'),
                                new OA\Property(property: 'date_inscription', type: 'string', format: 'date-time'),
                                new OA\Property(property: 'roles', type: 'array',
                                    items: new OA\Items(type: 'object',
                                        properties: [
                                            new OA\Property(property: 'id', type: 'integer', example: 4),
                                            new OA\Property(property: 'code', type: 'string', example: 'clients'),
                                            new OA\Property(property: 'nom', type: 'string', example: 'Client'),
                                            new OA\Property(property: 'niveau', type: 'integer', example: 4),
                                        ]
                                    )
                                ),
                            ]
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifie'),
        ]
    )]
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('roles'),
        ]);
    }
}
