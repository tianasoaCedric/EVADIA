<?php

namespace App\Http\Controllers\Api\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Photo;
use App\Models\Propriete;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use OpenApi\Attributes as OA;

class RoomController extends Controller
{
    use BelongsToHotel;

    #[OA\Get(
        path: '/api/hotel/rooms',
        summary: 'Liste des chambres',
        description: 'Retourne la liste des chambres/propriétés de l\'hôtel avec photos, prix et statut actuels.',
        tags: ['Hôtel - Chambres'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'type', in: 'query', required: false, description: 'Filtrer par type de chambre', schema: new OA\Schema(type: 'string')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des chambres',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'nom', type: 'string', example: 'Suite Deluxe'),
                            new OA\Property(property: 'type_propriete', type: 'string', example: 'suite'),
                            new OA\Property(property: 'capacite', type: 'integer', example: 4),
                            new OA\Property(property: 'nb_chambres', type: 'integer', example: 2),
                            new OA\Property(property: 'nb_lits', type: 'integer', example: 3),
                            new OA\Property(property: 'superficie', type: 'integer', example: 55),
                            new OA\Property(property: 'prix_actuel', type: 'number', format: 'float', nullable: true, example: 180.00),
                            new OA\Property(property: 'statut', type: 'string', nullable: true, example: 'disponible'),
                            new OA\Property(property: 'photo_principale', type: 'string', nullable: true, example: 'https://s3.../photo.jpg'),
                        ])),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $hotel = $this->getHotel();
        $query = $hotel->proprietes()
            ->with(['currentPrix', 'currentStatut', 'photoPrincipale']);

        if ($type = $request->input('type')) {
            $query->where('type_propriete', $type);
        }

        $rooms = $query->get()->map(fn($r) => [
            'id' => $r->id,
            'nom' => $r->nom,
            'type_propriete' => $r->type_propriete,
            'capacite' => $r->capacite,
            'nb_chambres' => $r->nb_chambres,
            'nb_lits' => $r->nb_lits,
            'superficie' => $r->superficie,
            'prix_actuel' => $r->currentPrix?->prix_par_nuit,
            'statut' => $r->currentStatut?->statut,
            'photo_principale' => $r->photoPrincipale?->url_photo,
        ]);

        return response()->json(['data' => $rooms]);
    }

    #[OA\Get(
        path: '/api/hotel/rooms/{id}',
        summary: 'Détails d\'une chambre',
        description: 'Retourne les informations complètes d\'une chambre avec photos, équipements, prix et disponibilités.',
        tags: ['Hôtel - Chambres'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Détails de la chambre',
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: 'data', type: 'object')]
                )
            ),
            new OA\Response(response: 404, description: 'Chambre non trouvée'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $hotel = $this->getHotel();
        $room = $hotel->proprietes()
            ->with(['currentPrix', 'currentStatut', 'photos', 'equipements'])
            ->find($id);

        if (!$room) {
            return response()->json(['message' => 'Chambre non trouvée'], 404);
        }

        return response()->json(['data' => $room]);
    }

    #[OA\Post(
        path: '/api/hotel/rooms',
        summary: 'Créer une chambre',
        description: 'Ajoute une nouvelle chambre/propriété à l\'hôtel.',
        tags: ['Hôtel - Chambres'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['nom', 'type_propriete', 'capacite'],
                properties: [
                    new OA\Property(property: 'nom', type: 'string', example: 'Suite Deluxe 201'),
                    new OA\Property(property: 'description', type: 'string', example: 'Suite spacieuse avec vue mer'),
                    new OA\Property(property: 'type_propriete', type: 'string', example: 'suite'),
                    new OA\Property(property: 'capacite', type: 'integer', example: 4),
                    new OA\Property(property: 'nb_chambres', type: 'integer', example: 2),
                    new OA\Property(property: 'nb_lits', type: 'integer', example: 3),
                    new OA\Property(property: 'nb_salles_bain', type: 'integer', example: 1),
                    new OA\Property(property: 'superficie', type: 'integer', example: 55),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Chambre créée', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Chambre créée avec succès'),
                    new OA\Property(property: 'data', type: 'object'),
                ]
            )),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $hotel = $this->getHotel();

        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type_propriete' => 'required|string|max:100',
            'capacite' => 'required|integer|min:1',
            'nb_chambres' => 'nullable|integer|min:0',
            'nb_lits' => 'nullable|integer|min:0',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|integer|min:1',
        ]);

        $room = $hotel->proprietes()->create([
            ...$validated,
            'created_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Chambre créée avec succès', 'data' => $room], 201);
    }

    #[OA\Put(
        path: '/api/hotel/rooms/{id}',
        summary: 'Modifier une chambre',
        tags: ['Hôtel - Chambres'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'nom', type: 'string', example: 'Suite Deluxe 201'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'type_propriete', type: 'string'),
                    new OA\Property(property: 'capacite', type: 'integer'),
                    new OA\Property(property: 'nb_chambres', type: 'integer'),
                    new OA\Property(property: 'nb_lits', type: 'integer'),
                    new OA\Property(property: 'nb_salles_bain', type: 'integer'),
                    new OA\Property(property: 'superficie', type: 'integer'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Chambre mise à jour'),
            new OA\Response(response: 404, description: 'Chambre non trouvée'),
        ]
    )]
    public function update(Request $request, int $id): JsonResponse
    {
        $hotel = $this->getHotel();
        $room = $hotel->proprietes()->findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type_propriete' => 'sometimes|string|max:100',
            'capacite' => 'sometimes|integer|min:1',
            'nb_chambres' => 'nullable|integer|min:0',
            'nb_lits' => 'nullable|integer|min:0',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|integer|min:1',
        ]);

        $room->update($validated);

        return response()->json(['message' => 'Chambre mise à jour', 'data' => $room]);
    }

    #[OA\Delete(
        path: '/api/hotel/rooms/{id}',
        summary: 'Supprimer une chambre',
        tags: ['Hôtel - Chambres'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Chambre supprimée'),
            new OA\Response(response: 404, description: 'Chambre non trouvée'),
        ]
    )]
    public function destroy(int $id): JsonResponse
    {
        $hotel = $this->getHotel();
        $room = $hotel->proprietes()->findOrFail($id);
        $room->delete();

        return response()->json(['message' => 'Chambre supprimée avec succès']);
    }
}
