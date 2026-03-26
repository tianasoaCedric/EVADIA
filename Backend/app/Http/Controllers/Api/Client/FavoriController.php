<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Favori;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class FavoriController extends Controller
{
    #[OA\Get(
        path: '/api/client/favorites',
        summary: 'Mes hôtels favoris',
        description: 'Retourne la liste des hôtels mis en favoris par le client.',
        tags: ['Client - Favoris'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des favoris',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'hotel', type: 'object', properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 5),
                                new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Renaissance'),
                                new OA\Property(property: 'etoiles', type: 'integer', example: 4),
                                new OA\Property(property: 'photo_principale', type: 'string', nullable: true),
                            ]),
                            new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                        ])),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function index(): JsonResponse
    {
        $favoris = Favori::with(['hotel.photoPrincipale', 'hotel.adresse'])
            ->where('user_id', auth()->id())
            ->latest('created_at')
            ->get();

        return response()->json(['data' => $favoris]);
    }

    #[OA\Post(
        path: '/api/client/favorites',
        summary: 'Ajouter un hôtel aux favoris',
        tags: ['Client - Favoris'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['hotel_id'],
                properties: [
                    new OA\Property(property: 'hotel_id', type: 'integer', example: 5),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Ajouté aux favoris', content: new OA\JsonContent(
                properties: [new OA\Property(property: 'message', type: 'string', example: 'Hôtel ajouté aux favoris.')]
            )),
            new OA\Response(response: 409, description: 'Déjà en favoris'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $request->validate(['hotel_id' => 'required|exists:hotels,id']);

        $exists = Favori::where('user_id', auth()->id())
            ->where('hotel_id', $request->hotel_id)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Cet hôtel est déjà dans vos favoris.'], 409);
        }

        Favori::create([
            'user_id' => auth()->id(),
            'hotel_id' => $request->hotel_id,
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Hôtel ajouté aux favoris.'], 201);
    }

    #[OA\Delete(
        path: '/api/client/favorites/{hotelId}',
        summary: 'Retirer un hôtel des favoris',
        tags: ['Client - Favoris'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'hotelId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Retiré des favoris'),
            new OA\Response(response: 404, description: 'Favori non trouvé'),
        ]
    )]
    public function destroy(int $hotelId): JsonResponse
    {
        $deleted = Favori::where('user_id', auth()->id())
            ->where('hotel_id', $hotelId)
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Favori non trouvé'], 404);
        }

        return response()->json(['message' => 'Hôtel retiré des favoris.']);
    }
}
