<?php

namespace App\Http\Controllers\Api\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Offre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class OffreController extends Controller
{
    use BelongsToHotel;

    #[OA\Get(
        path: '/api/hotel/offers',
        summary: 'Liste des offres de l\'hôtel',
        description: 'Retourne les offres propres à l\'hôtel et les offres globales EVADIA.',
        tags: ['Hôtel - Offres'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Offres de l\'hôtel et offres globales',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'mes_offres', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'titre', type: 'string', example: 'Weekend Spécial'),
                            new OA\Property(property: 'date_debut', type: 'string', format: 'date'),
                            new OA\Property(property: 'date_fin', type: 'string', format: 'date'),
                            new OA\Property(property: 'statut', type: 'string', example: 'active'),
                            new OA\Property(property: 'code_promo', type: 'string', nullable: true),
                        ])),
                        new OA\Property(property: 'offres_evadia', type: 'array', items: new OA\Items(type: 'object')),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function index(): JsonResponse
    {
        $hotel = $this->getHotel();

        $mesOffres = Offre::with('avantages')
            ->where('hotel_id', $hotel->id)
            ->latest('created_at')->get();

        $offresEvadia = Offre::with('avantages')
            ->where(fn($q) => $q->whereNull('hotel_id')->orWhere('hotel_id', '!=', $hotel->id))
            ->where('statut', 'active')
            ->latest('created_at')->get();

        return response()->json([
            'mes_offres' => $mesOffres,
            'offres_evadia' => $offresEvadia,
        ]);
    }

    #[OA\Post(
        path: '/api/hotel/offers',
        summary: 'Créer une offre pour l\'hôtel',
        tags: ['Hôtel - Offres'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['titre', 'date_debut', 'date_fin'],
                properties: [
                    new OA\Property(property: 'titre', type: 'string', example: 'Weekend Spécial -15%'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'date_debut', type: 'string', format: 'date'),
                    new OA\Property(property: 'date_fin', type: 'string', format: 'date'),
                    new OA\Property(property: 'code_promo', type: 'string', nullable: true),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Offre créée'),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $hotel = $this->getHotel();

        $validated = $request->validate([
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'code_promo' => 'nullable|string|max:50|unique:offres,code_promo',
        ]);

        $offre = Offre::create([
            ...$validated,
            'hotel_id' => $hotel->id,
            'statut' => 'active',
            'created_by' => auth()->id(),
        ]);

        return response()->json(['message' => 'Offre créée avec succès', 'data' => $offre], 201);
    }

    #[OA\Patch(
        path: '/api/hotel/offers/{id}/toggle',
        summary: 'Activer/désactiver une offre',
        tags: ['Hôtel - Offres'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Statut modifié'),
            new OA\Response(response: 404, description: 'Offre non trouvée'),
        ]
    )]
    public function toggle(int $id): JsonResponse
    {
        $hotel = $this->getHotel();
        $offre = Offre::where('hotel_id', $hotel->id)->findOrFail($id);

        $offre->update([
            'statut' => $offre->statut === 'active' ? 'inactive' : 'active',
        ]);

        return response()->json([
            'message' => $offre->statut === 'active' ? 'Offre activée.' : 'Offre désactivée.',
            'statut' => $offre->statut,
        ]);
    }
}
