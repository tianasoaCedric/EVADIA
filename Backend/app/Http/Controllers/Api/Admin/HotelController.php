<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class HotelController extends Controller
{
    #[OA\Get(
        path: '/api/admin/hotels',
        summary: 'Liste des hôtels',
        description: 'Récupère la liste de tous les hôtels existants.',
        tags: ['Admin - Hôtels'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des hôtels récupérée avec succès',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                type: 'object',
                                properties: [
                                    new OA\Property(property: 'id', type: 'integer', example: 1),
                                    new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Renaissance'),
                                    new OA\Property(property: 'email_contact', type: 'string', example: 'contact@renaissance.com'),
                                    new OA\Property(property: 'telephone', type: 'string', example: '+33102030405'),
                                    new OA\Property(property: 'etoiles', type: 'integer', example: 5)
                                ]
                            )
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Non autorisé (niveau admin requis)'),
        ]
    )]
    public function index(): JsonResponse
    {
        // On récupère simplement la liste pour la démonstration de l'API avec Swagger
        $hotels = Hotel::all();
        return response()->json(['data' => $hotels]);
    }

    #[OA\Post(
        path: '/api/admin/hotels',
        summary: 'Créer un hôtel',
        description: 'Ajoute un nouvel hôtel dans la base de données.',
        tags: ['Admin - Hôtels'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['nom', 'email_contact'],
                properties: [
                    new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Paris'),
                    new OA\Property(property: 'email_contact', type: 'string', format: 'email', example: 'contact@hotel-paris.com'),
                    new OA\Property(property: 'telephone', type: 'string', example: '+33111222333'),
                    new OA\Property(property: 'description', type: 'string', example: 'Un bel hôtel au coeur de Paris.'),
                    new OA\Property(property: 'etoiles', type: 'integer', example: 4)
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Hôtel créé avec succès',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Hôtel créé avec succès'),
                        new OA\Property(property: 'hotel', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Données invalides'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Non autorisé')
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'email_contact' => 'required|email|max:255',
            'telephone' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'etoiles' => 'nullable|integer|min:1|max:5',
        ]);

        $hotel = Hotel::create($validated);

        return response()->json([
            'message' => 'Hôtel créé avec succès',
            'hotel' => $hotel
        ], 201);
    }

    #[OA\Get(
        path: '/api/admin/hotels/{id}',
        summary: 'Détails d\'un hôtel',
        description: 'Récupère les informations complètes d\'un hôtel spécifique',
        tags: ['Admin - Hôtels'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID de l\'hôtel',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Informations de l\'hôtel',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Hôtel non trouvé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Non autorisé')
        ]
    )]
    public function show($id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json(['message' => 'Hôtel non trouvé'], 404);
        }

        return response()->json(['data' => $hotel]);
    }

    #[OA\Put(
        path: '/api/admin/hotels/{id}',
        summary: 'Mettre à jour un hôtel',
        description: 'Modifie les données d\'un hôtel existant.',
        tags: ['Admin - Hôtels'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID de l\'hôtel',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Paris Modifié'),
                    new OA\Property(property: 'email_contact', type: 'string', format: 'email', example: 'contact@hotel-paris.com'),
                    new OA\Property(property: 'telephone', type: 'string', example: '+33111222333'),
                    new OA\Property(property: 'description', type: 'string', example: 'Description de l\'hôtel modifiée'),
                    new OA\Property(property: 'etoiles', type: 'integer', example: 5)
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Hôtel mis à jour avec succès',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Hôtel mis à jour avec succès'),
                        new OA\Property(property: 'hotel', type: 'object')
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Hôtel non trouvé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Non autorisé')
        ]
    )]
    public function update(Request $request, $id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json(['message' => 'Hôtel non trouvé'], 404);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'email_contact' => 'sometimes|email|max:255',
            'telephone' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'etoiles' => 'nullable|integer|min:1|max:5',
        ]);

        $hotel->update($validated);

        return response()->json([
            'message' => 'Hôtel mis à jour avec succès',
            'hotel' => $hotel
        ]);
    }

    #[OA\Delete(
        path: '/api/admin/hotels/{id}',
        summary: 'Supprimer un hôtel',
        description: 'Supprime un hôtel de la base de données.',
        tags: ['Admin - Hôtels'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID de l\'hôtel',
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Hôtel supprimé',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Hôtel supprimé avec succès')
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Hôtel non trouvé'),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Non autorisé')
        ]
    )]
    public function destroy($id): JsonResponse
    {
        $hotel = Hotel::find($id);

        if (!$hotel) {
            return response()->json(['message' => 'Hôtel non trouvé'], 404);
        }

        $hotel->delete();

        return response()->json(['message' => 'Hôtel supprimé avec succès']);
    }
}
