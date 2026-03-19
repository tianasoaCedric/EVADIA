<?php

namespace App\Http\Controllers\Api\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Paiement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class PaymentController extends Controller
{
    use BelongsToHotel;

    #[OA\Get(
        path: '/api/hotel/payments',
        summary: 'Liste des paiements',
        description: 'Retourne les paiements reçus pour les réservations de l\'hôtel.',
        tags: ['Hôtel - Paiements'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'statut', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['en_attente', 'complete', 'echoue', 'rembourse'])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste paginée des paiements',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'montant', type: 'number', format: 'float', example: 360.00),
                            new OA\Property(property: 'devise_montant', type: 'string', example: 'EUR'),
                            new OA\Property(property: 'statut', type: 'string', example: 'complete'),
                            new OA\Property(property: 'transaction_id', type: 'string', example: 'txn_abc123'),
                            new OA\Property(property: 'date_paiement', type: 'string', format: 'date-time'),
                            new OA\Property(property: 'reservation', type: 'object', properties: [
                                new OA\Property(property: 'code_reservation', type: 'string', example: 'EV-a1b2c3d4'),
                                new OA\Property(property: 'client', type: 'object', properties: [
                                    new OA\Property(property: 'nom', type: 'string', example: 'Leclerc'),
                                    new OA\Property(property: 'prenom', type: 'string', example: 'Marie'),
                                ]),
                            ]),
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
        $proprieteIds = $hotel->proprietes()->pluck('id');

        $query = Paiement::with(['reservation.client', 'methodePaiement'])
            ->whereHas('reservation', fn($q) => $q->whereIn('propriete_id', $proprieteIds));

        if ($statut = $request->input('statut')) {
            $query->where('statut', $statut);
        }

        return response()->json($query->latest('date_paiement')->paginate(15));
    }

    #[OA\Get(
        path: '/api/hotel/payments/{id}',
        summary: 'Détails d\'un paiement',
        tags: ['Hôtel - Paiements'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Détails du paiement', content: new OA\JsonContent(
                properties: [new OA\Property(property: 'data', type: 'object')]
            )),
            new OA\Response(response: 404, description: 'Paiement non trouvé'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $hotel = $this->getHotel();
        $proprieteIds = $hotel->proprietes()->pluck('id');

        $paiement = Paiement::with(['reservation.client', 'reservation.propriete', 'methodePaiement'])
            ->whereHas('reservation', fn($q) => $q->whereIn('propriete_id', $proprieteIds))
            ->find($id);

        if (!$paiement) {
            return response()->json(['message' => 'Paiement non trouvé'], 404);
        }

        return response()->json(['data' => $paiement]);
    }
}
