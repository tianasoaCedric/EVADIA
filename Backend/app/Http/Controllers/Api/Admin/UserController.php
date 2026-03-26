<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Get(
        path: '/api/admin/users',
        summary: 'Liste des utilisateurs',
        description: 'Retourne la liste paginée des utilisateurs avec leurs rôles.',
        tags: ['Admin - Utilisateurs'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
            new OA\Parameter(name: 'search', in: 'query', required: false, description: 'Recherche par nom, prénom ou email', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'role', in: 'query', required: false, description: 'Filtrer par code rôle', schema: new OA\Schema(type: 'string', enum: ['super_admin', 'admin_evadia', 'admin_hotel', 'gestionnaire_hotel', 'client'])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste paginée des utilisateurs',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
                            new OA\Property(property: 'prenom', type: 'string', example: 'Jean'),
                            new OA\Property(property: 'email', type: 'string', example: 'jean@test.com'),
                            new OA\Property(property: 'est_actif', type: 'boolean', example: true),
                            new OA\Property(property: 'roles', type: 'array', items: new OA\Items(type: 'object', properties: [
                                new OA\Property(property: 'code', type: 'string', example: 'client'),
                                new OA\Property(property: 'nom', type: 'string', example: 'Client'),
                            ])),
                        ])),
                        new OA\Property(property: 'current_page', type: 'integer', example: 1),
                        new OA\Property(property: 'last_page', type: 'integer', example: 5),
                        new OA\Property(property: 'total', type: 'integer', example: 75),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Non autorisé'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'ilike', "%{$search}%")
                    ->orWhere('prenom', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->whereHas('roles', fn($q) => $q->where('code', $role));
        }

        $users = $query->latest('date_inscription')
            ->paginate($request->input('per_page', 15));

        return response()->json($users);
    }

    #[OA\Get(
        path: '/api/admin/users/{id}',
        summary: 'Détails d\'un utilisateur',
        description: 'Retourne les informations complètes d\'un utilisateur avec ses rôles et réservations.',
        tags: ['Admin - Utilisateurs'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Détails de l\'utilisateur',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'nom', type: 'string', example: 'Dupont'),
                            new OA\Property(property: 'prenom', type: 'string', example: 'Jean'),
                            new OA\Property(property: 'email', type: 'string', example: 'jean@test.com'),
                            new OA\Property(property: 'telephone', type: 'string', example: '+33612345678'),
                            new OA\Property(property: 'est_actif', type: 'boolean', example: true),
                            new OA\Property(property: 'date_inscription', type: 'string', format: 'date-time'),
                            new OA\Property(property: 'derniere_connexion', type: 'string', format: 'date-time'),
                        ]),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Utilisateur non trouvé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $user = User::with(['roles', 'reservations.propriete.hotel'])->find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        return response()->json(['data' => $user]);
    }

    #[OA\Patch(
        path: '/api/admin/users/{id}/toggle-status',
        summary: 'Activer/désactiver un utilisateur',
        description: 'Bascule le statut actif/inactif d\'un utilisateur.',
        tags: ['Admin - Utilisateurs'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Statut mis à jour',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Utilisateur désactivé.'),
                        new OA\Property(property: 'est_actif', type: 'boolean', example: false),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Utilisateur non trouvé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function toggleStatus(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['est_actif' => !$user->est_actif]);

        return response()->json([
            'message' => $user->est_actif ? 'Utilisateur activé.' : 'Utilisateur désactivé.',
            'est_actif' => $user->est_actif,
        ]);
    }
}
