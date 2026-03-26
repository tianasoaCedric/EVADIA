<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class RegisterController extends Controller
{
    #[OA\Post(
        path: '/api/auth/register',
        summary: 'Inscription',
        description: 'Cree un nouveau compte utilisateur avec le role "clients" par defaut',
        tags: ['Authentification'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['nom', 'prenom', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'nom', type: 'string', maxLength: 100, example: 'Dupont'),
                    new OA\Property(property: 'prenom', type: 'string', maxLength: 100, example: 'Cedric'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'cedric@example.com'),
                    new OA\Property(property: 'password', type: 'string', minLength: 8, example: 'password123'),
                    new OA\Property(property: 'password_confirmation', type: 'string', example: 'password123'),
                    new OA\Property(property: 'telephone', type: 'string', maxLength: 20, example: '+33612345678', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Inscription reussie',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'user', type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
                                new OA\Property(property: 'prenom', type: 'string', example: 'Cedric'),
                                new OA\Property(property: 'email', type: 'string', example: 'cedric@example.com'),
                                new OA\Property(property: 'roles', type: 'array',
                                    items: new OA\Items(type: 'object',
                                        properties: [
                                            new OA\Property(property: 'code', type: 'string', example: 'clients'),
                                            new OA\Property(property: 'nom', type: 'string', example: 'Client'),
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
                description: 'Erreur de validation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'The email has already been taken.'),
                        new OA\Property(property: 'errors', type: 'object'),
                    ]
                )
            ),
            new OA\Response(response: 429, description: 'Trop de tentatives (rate limit)'),
        ]
    )]
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password_hash' => $request->password,
            'telephone' => $request->telephone,
        ]);

        $clientRole = Role::where('code', 'clients')->first();
        if ($clientRole) {
            $user->roles()->attach($clientRole->id, [
                'est_actif' => true,
                'assigned_at' => now(),
            ]);
        }

        $user->load('roles');

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    }
}
