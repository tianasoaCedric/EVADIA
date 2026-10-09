<?php

namespace App\Http\Controllers\Api\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Disponibilite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class CalendarController extends Controller
{
    use BelongsToHotel;

    #[OA\Get(
        path: '/api/hotel/calendar',
        summary: 'Disponibilités du calendrier',
        description: 'Retourne les disponibilités et prix spéciaux par chambre pour une période donnée.',
        tags: ['Hôtel - Calendrier'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'date_debut', in: 'query', required: true, schema: new OA\Schema(type: 'string', format: 'date', example: '2026-04-01')),
            new OA\Parameter(name: 'date_fin', in: 'query', required: true, schema: new OA\Schema(type: 'string', format: 'date', example: '2026-04-30')),
            new OA\Parameter(name: 'propriete_id', in: 'query', required: false, description: 'Filtrer par chambre', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Données du calendrier',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'propriete_id', type: 'integer', example: 3),
                            new OA\Property(property: 'date', type: 'string', format: 'date', example: '2026-04-15'),
                            new OA\Property(property: 'est_disponible', type: 'boolean', example: true),
                            new OA\Property(property: 'prix_special', type: 'number', format: 'float', nullable: true, example: 199.99),
                            new OA\Property(property: 'minimum_nuits', type: 'integer', example: 2),
                        ])),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 422, description: 'Paramètres manquants'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'propriete_id' => 'nullable|integer',
        ]);

        $hotel = $this->getHotel();
        $proprieteIds = $hotel->proprietes()->pluck('id');

        $query = Disponibilite::whereIn('propriete_id', $proprieteIds)
            ->whereBetween('date', [$request->date_debut, $request->date_fin]);

        if ($request->propriete_id) {
            $query->where('propriete_id', $request->propriete_id);
        }

        return response()->json(['data' => $query->orderBy('date')->get()]);
    }

    #[OA\Post(
        path: '/api/hotel/calendar/disponibilite',
        summary: 'Mettre à jour une disponibilité',
        description: 'Met à jour la disponibilité et le prix spécial d\'une chambre pour une date donnée.',
        tags: ['Hôtel - Calendrier'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['propriete_id', 'date', 'est_disponible'],
                properties: [
                    new OA\Property(property: 'propriete_id', type: 'integer', example: 3),
                    new OA\Property(property: 'date', type: 'string', format: 'date', example: '2026-04-15'),
                    new OA\Property(property: 'est_disponible', type: 'boolean', example: true),
                    new OA\Property(property: 'prix_special', type: 'number', format: 'float', nullable: true, example: 199.99),
                    new OA\Property(property: 'minimum_nuits', type: 'integer', nullable: true, example: 2),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Disponibilité mise à jour', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Disponibilité mise à jour.'),
                    new OA\Property(property: 'data', type: 'object'),
                ]
            )),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'date' => 'required|date',
            'est_disponible' => 'required|boolean',
            'prix_special' => 'nullable|numeric|min:0',
            'minimum_nuits' => 'nullable|integer|min:1',
        ]);

        $hotel = $this->getHotel();
        $hotel->proprietes()->findOrFail($request->propriete_id);

        $dispo = Disponibilite::updateOrCreate(
            ['propriete_id' => $request->propriete_id, 'date' => $request->date],
            [
                'est_disponible' => $request->est_disponible,
                'prix_special' => $request->prix_special,
                'minimum_nuits' => $request->minimum_nuits,
                'updated_by' => auth()->id(),
            ]
        );

        return response()->json(['message' => 'Disponibilité mise à jour.', 'data' => $dispo]);
    }

    #[OA\Post(
        path: '/api/hotel/calendar/bulk',
        summary: 'Mise à jour en masse',
        description: 'Met à jour la disponibilité pour une plage de dates et plusieurs chambres.',
        tags: ['Hôtel - Calendrier'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['propriete_ids', 'date_debut', 'date_fin', 'est_disponible'],
                properties: [
                    new OA\Property(property: 'propriete_ids', type: 'array', items: new OA\Items(type: 'integer'), example: [1, 2, 3]),
                    new OA\Property(property: 'date_debut', type: 'string', format: 'date', example: '2026-04-01'),
                    new OA\Property(property: 'date_fin', type: 'string', format: 'date', example: '2026-04-15'),
                    new OA\Property(property: 'est_disponible', type: 'boolean', example: false),
                    new OA\Property(property: 'prix_special', type: 'number', nullable: true, example: 150.00),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Mise à jour en masse effectuée', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Disponibilités mises à jour.'),
                    new OA\Property(property: 'count', type: 'integer', example: 45),
                ]
            )),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function bulk(Request $request): JsonResponse
    {
        $request->validate([
            'propriete_ids' => 'required|array|min:1',
            'propriete_ids.*' => 'exists:proprietes,id',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after_or_equal:date_debut',
            'est_disponible' => 'required|boolean',
            'prix_special' => 'nullable|numeric|min:0',
        ]);

        $hotel = $this->getHotel();
        $hotelProprieteIds = $hotel->proprietes()->pluck('id')->toArray();
        $validIds = array_intersect($request->propriete_ids, $hotelProprieteIds);

        $count = 0;
        $period = new \DatePeriod(
            new \DateTime($request->date_debut),
            new \DateInterval('P1D'),
            (new \DateTime($request->date_fin))->modify('+1 day')
        );

        foreach ($validIds as $proprieteId) {
            foreach ($period as $date) {
                Disponibilite::updateOrCreate(
                    ['propriete_id' => $proprieteId, 'date' => $date->format('Y-m-d')],
                    [
                        'est_disponible' => $request->est_disponible,
                        'prix_special' => $request->prix_special,
                        'updated_by' => auth()->id(),
                    ]
                );
                $count++;
            }
        }

        return response()->json(['message' => 'Disponibilités mises à jour.', 'count' => $count]);
    }
}
