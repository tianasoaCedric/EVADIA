<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Disponibilite;
use App\Models\Propriete;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ReservationController extends Controller
{
    #[OA\Get(
        path: '/api/client/reservations',
        summary: 'Mes réservations',
        description: 'Retourne les réservations du client connecté.',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'statut', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['en_attente', 'confirmee', 'annulee', 'terminee'])),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des réservations du client',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'code_reservation', type: 'string', example: 'EV-a1b2c3d4'),
                            new OA\Property(property: 'date_debut', type: 'string', format: 'date'),
                            new OA\Property(property: 'date_fin', type: 'string', format: 'date'),
                            new OA\Property(property: 'prix_total', type: 'number', format: 'float', example: 720.00),
                            new OA\Property(property: 'statut', type: 'string', example: 'confirmee'),
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
    public function index(Request $request): JsonResponse
    {
        $query = Reservation::with(['propriete.hotel', 'propriete.photoPrincipale'])
            ->where('client_id', auth()->id());

        if ($statut = $request->input('statut')) {
            $query->where('statut', $statut);
        }

        return response()->json($query->latest('date_reservation')->paginate(10));
    }

    #[OA\Get(
        path: '/api/client/reservations/{id}',
        summary: 'Détails d\'une réservation',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Détails de la réservation', content: new OA\JsonContent(
                properties: [new OA\Property(property: 'data', type: 'object')]
            )),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
        ]
    )]
    public function show(int $id): JsonResponse
    {
        $reservation = Reservation::with(['propriete.hotel', 'propriete.photos', 'paiements', 'services', 'avis'])
            ->where('client_id', auth()->id())
            ->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Réservation non trouvée'], 404);
        }

        return response()->json(['data' => $reservation]);
    }

    #[OA\Post(
        path: '/api/client/reservations',
        summary: 'Créer une réservation',
        description: 'Effectue une nouvelle réservation. Vérifie la disponibilité de la chambre pour les dates demandées.',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['propriete_id', 'date_debut', 'date_fin', 'nb_adultes'],
                properties: [
                    new OA\Property(property: 'propriete_id', type: 'integer', example: 3),
                    new OA\Property(property: 'date_debut', type: 'string', format: 'date', example: '2026-04-10'),
                    new OA\Property(property: 'date_fin', type: 'string', format: 'date', example: '2026-04-15'),
                    new OA\Property(property: 'nb_adultes', type: 'integer', example: 2),
                    new OA\Property(property: 'nb_enfants', type: 'integer', example: 0),
                    new OA\Property(property: 'nb_bebes', type: 'integer', example: 0),
                    new OA\Property(property: 'demande_speciale', type: 'string', nullable: true, example: 'Vue sur mer si possible'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Réservation créée',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'message', type: 'string', example: 'Réservation créée avec succès'),
                        new OA\Property(property: 'data', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer'),
                            new OA\Property(property: 'code_reservation', type: 'string', example: 'EV-a1b2c3d4'),
                            new OA\Property(property: 'prix_total', type: 'number', example: 720.00),
                            new OA\Property(property: 'statut', type: 'string', example: 'en_attente'),
                        ]),
                    ]
                )
            ),
            new OA\Response(response: 409, description: 'Chambre non disponible pour ces dates'),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'date_debut' => 'required|date|after:today',
            'date_fin' => 'required|date|after:date_debut',
            'nb_adultes' => 'required|integer|min:1',
            'nb_enfants' => 'nullable|integer|min:0',
            'nb_bebes' => 'nullable|integer|min:0',
            'demande_speciale' => 'nullable|string|max:1000',
        ]);

        $propriete = Propriete::with('currentPrix')->findOrFail($validated['propriete_id']);

        // Check availability
        $indisponible = Disponibilite::where('propriete_id', $propriete->id)
            ->where('est_disponible', false)
            ->whereBetween('date', [$validated['date_debut'], $validated['date_fin']])
            ->exists();

        if ($indisponible) {
            return response()->json(['message' => 'La chambre n\'est pas disponible pour ces dates.'], 409);
        }

        // Check conflicting reservations
        $conflit = Reservation::where('propriete_id', $propriete->id)
            ->whereIn('statut', ['en_attente', 'confirmee'])
            ->where('date_debut', '<', $validated['date_fin'])
            ->where('date_fin', '>', $validated['date_debut'])
            ->exists();

        if ($conflit) {
            return response()->json(['message' => 'La chambre est déjà réservée pour ces dates.'], 409);
        }

        // Calculate price
        $nbNuits = (new \DateTime($validated['date_debut']))->diff(new \DateTime($validated['date_fin']))->days;
        $prixNuit = $propriete->currentPrix?->prix_par_nuit ?? 0;
        $prixTotal = $prixNuit * $nbNuits;

        $reservation = Reservation::create([
            'code_reservation' => Reservation::generateCode(),
            'client_id' => auth()->id(),
            'propriete_id' => $propriete->id,
            'date_debut' => $validated['date_debut'],
            'date_fin' => $validated['date_fin'],
            'nb_adultes' => $validated['nb_adultes'],
            'nb_enfants' => $validated['nb_enfants'] ?? 0,
            'nb_bebes' => $validated['nb_bebes'] ?? 0,
            'prix_total' => $prixTotal,
            'devise_prix_total' => $propriete->hotel?->devise_principale ?? 'EUR',
            'statut' => 'en_attente',
            'date_reservation' => now(),
            'demande_speciale' => $validated['demande_speciale'] ?? null,
        ]);

        return response()->json([
            'message' => 'Réservation créée avec succès',
            'data' => $reservation,
        ], 201);
    }

    #[OA\Patch(
        path: '/api/client/reservations/{id}/cancel',
        summary: 'Annuler une réservation',
        description: 'Le client annule sa réservation (si encore possible).',
        tags: ['Client - Réservations'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'raison', type: 'string', nullable: true, example: 'Changement de plans'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Réservation annulée'),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
            new OA\Response(response: 409, description: 'Annulation impossible (réservation déjà terminée ou annulée)'),
        ]
    )]
    public function cancel(Request $request, int $id): JsonResponse
    {
        $reservation = Reservation::where('client_id', auth()->id())->findOrFail($id);

        if (in_array($reservation->statut, ['annulee', 'terminee'])) {
            return response()->json(['message' => 'Cette réservation ne peut plus être annulée.'], 409);
        }

        $reservation->update([
            'statut' => 'annulee',
            'annulee_par' => auth()->id(),
            'raison_annulation' => $request->input('raison'),
        ]);

        return response()->json(['message' => 'Réservation annulée avec succès.']);
    }
}
