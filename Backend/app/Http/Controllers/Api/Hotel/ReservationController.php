<?php

namespace App\Http\Controllers\Api\Hotel;

use App\Actions\Reservation\RespondToReservationAction;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Reservation;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ReservationController extends Controller
{
    use BelongsToHotel;

    #[OA\Get(
        path: '/api/hotel/reservations',
        summary: 'Liste des réservations',
        description: 'Retourne les réservations de l\'hôtel avec filtres optionnels par statut et date.',
        tags: ['Hôtel - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'statut', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['en_attente', 'acceptee', 'refusee', 'annulee', 'terminee'])),
            new OA\Parameter(name: 'date_debut', in: 'query', required: false, description: 'Filtrer à partir de cette date', schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_fin', in: 'query', required: false, description: 'Filtrer jusqu\'à cette date', schema: new OA\Schema(type: 'string', format: 'date')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste paginée des réservations',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'code_reservation', type: 'string', example: 'EV-a1b2c3d4'),
                            new OA\Property(property: 'date_debut', type: 'string', format: 'date', example: '2026-04-01'),
                            new OA\Property(property: 'date_fin', type: 'string', format: 'date', example: '2026-04-05'),
                            new OA\Property(property: 'nb_adultes', type: 'integer', example: 2),
                            new OA\Property(property: 'nb_enfants', type: 'integer', example: 1),
                            new OA\Property(property: 'prix_total', type: 'number', format: 'float', example: 720.00),
                            new OA\Property(property: 'statut', type: 'string', example: 'acceptee'),
                            new OA\Property(property: 'client', type: 'object', properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 10),
                                new OA\Property(property: 'nom', type: 'string', example: 'Leclerc'),
                                new OA\Property(property: 'prenom', type: 'string', example: 'Marie'),
                            ]),
                            new OA\Property(property: 'propriete', type: 'object', properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 3),
                                new OA\Property(property: 'nom', type: 'string', example: 'Chambre 201'),
                            ]),
                        ])),
                        new OA\Property(property: 'current_page', type: 'integer'),
                        new OA\Property(property: 'last_page', type: 'integer'),
                        new OA\Property(property: 'total', type: 'integer'),
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

        $query = Reservation::with(['client', 'propriete'])
            ->whereIn('propriete_id', $proprieteIds);

        if ($statut = $request->input('statut')) {
            $query->where('statut', $statut);
        }
        if ($dateDebut = $request->input('date_debut')) {
            $query->where('date_debut', '>=', $dateDebut);
        }
        if ($dateFin = $request->input('date_fin')) {
            $query->where('date_fin', '<=', $dateFin);
        }

        return response()->json(
            $query->latest('date_reservation')->paginate($request->input('per_page', 15))
        );
    }

    #[OA\Get(
        path: '/api/hotel/reservations/{id}',
        summary: 'Détails d\'une réservation',
        description: 'Retourne les informations complètes d\'une réservation avec client, chambre, paiements et services.',
        tags: ['Hôtel - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Détails de la réservation',
                content: new OA\JsonContent(
                    properties: [new OA\Property(property: 'data', type: 'object')]
                )
            ),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $hotel = $this->getHotel();
        $proprieteIds = $hotel->proprietes()->pluck('id');

        $reservation = Reservation::with(['client', 'propriete', 'facture', 'services', 'avis'])
            ->whereIn('propriete_id', $proprieteIds)
            ->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Réservation non trouvée'], 404);
        }

        return response()->json(['data' => $reservation]);
    }

    #[OA\Patch(
        path: '/api/hotel/reservations/{id}/accept',
        summary: 'Accepter une demande de réservation',
        description: 'L\'hôtel accepte une réservation en attente. Génère une facture et envoie un email de confirmation au client.',
        tags: ['Hôtel - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Réservation acceptée'),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
            new OA\Response(response: 409, description: 'Transition non autorisée'),
        ]
    )]
    public function accept(Request $request, int $id): JsonResponse
    {
        $hotel = $this->getHotel();
        $proprieteIds = $hotel->proprietes()->pluck('id');

        $reservation = Reservation::whereIn('propriete_id', $proprieteIds)->findOrFail($id);

        try {
            $reservation = app(RespondToReservationAction::class)->accept($reservation, auth()->id());
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return response()->json(['message' => 'Réservation acceptée.', 'statut' => $reservation->statut]);
    }

    #[OA\Patch(
        path: '/api/hotel/reservations/{id}/reject',
        summary: 'Refuser une demande de réservation',
        description: 'L\'hôtel refuse une réservation en attente. Envoie un email de refus au client.',
        tags: ['Hôtel - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['raison'],
                properties: [
                    new OA\Property(property: 'raison', type: 'string', example: 'Chambre indisponible pour ces dates'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Réservation refusée'),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
            new OA\Response(response: 409, description: 'Transition non autorisée'),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'raison' => 'required|string|max:1000',
        ]);

        $hotel = $this->getHotel();
        $proprieteIds = $hotel->proprietes()->pluck('id');

        $reservation = Reservation::whereIn('propriete_id', $proprieteIds)->findOrFail($id);

        try {
            $reservation = app(RespondToReservationAction::class)->reject($reservation, auth()->id(), $request->raison);
        } catch (DomainException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        }

        return response()->json(['message' => 'Réservation refusée.', 'statut' => $reservation->statut]);
    }
}
