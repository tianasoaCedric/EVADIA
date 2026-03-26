<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Avis;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AvisController extends Controller
{
    #[OA\Get(
        path: '/api/client/reviews',
        summary: 'Mes avis',
        description: 'Retourne les avis laissés par le client avec les réponses des hôtels.',
        tags: ['Client - Avis'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des avis du client',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'note', type: 'integer', example: 4),
                            new OA\Property(property: 'commentaire', type: 'string', example: 'Excellent séjour'),
                            new OA\Property(property: 'reponse_hotel', type: 'string', nullable: true, example: 'Merci pour votre avis !'),
                            new OA\Property(property: 'date_avis', type: 'string', format: 'date-time'),
                            new OA\Property(property: 'propriete', type: 'object', properties: [
                                new OA\Property(property: 'nom', type: 'string', example: 'Suite Deluxe'),
                                new OA\Property(property: 'hotel', type: 'object', properties: [
                                    new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Renaissance'),
                                ]),
                            ]),
                        ])),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function index(): JsonResponse
    {
        $avis = Avis::with(['propriete.hotel'])
            ->where('client_id', auth()->id())
            ->latest('date_avis')
            ->get();

        return response()->json(['data' => $avis]);
    }

    #[OA\Post(
        path: '/api/client/reviews',
        summary: 'Laisser un avis',
        description: 'Publie un avis sur une réservation terminée. Un seul avis par réservation.',
        tags: ['Client - Avis'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['reservation_id', 'note', 'commentaire'],
                properties: [
                    new OA\Property(property: 'reservation_id', type: 'integer', example: 12),
                    new OA\Property(property: 'note', type: 'integer', minimum: 1, maximum: 5, example: 4),
                    new OA\Property(property: 'commentaire', type: 'string', example: 'Excellent séjour, personnel très accueillant.'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Avis publié', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Avis publié avec succès.'),
                    new OA\Property(property: 'data', type: 'object'),
                ]
            )),
            new OA\Response(response: 409, description: 'Un avis existe déjà pour cette réservation'),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'required|string|max:2000',
        ]);

        $reservation = Reservation::where('client_id', auth()->id())
            ->where('statut', 'terminee')
            ->findOrFail($validated['reservation_id']);

        if ($reservation->avis) {
            return response()->json(['message' => 'Vous avez déjà laissé un avis pour cette réservation.'], 409);
        }

        $avis = Avis::create([
            'reservation_id' => $reservation->id,
            'client_id' => auth()->id(),
            'propriete_id' => $reservation->propriete_id,
            'note' => $validated['note'],
            'commentaire' => $validated['commentaire'],
            'date_avis' => now(),
        ]);

        return response()->json(['message' => 'Avis publié avec succès.', 'data' => $avis], 201);
    }
}
