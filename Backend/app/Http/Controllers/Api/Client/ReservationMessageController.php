<?php

namespace App\Http\Controllers\Api\Client;

use App\Actions\Reservation\RespondToReservationAction;
use App\Actions\Reservation\SendReservationMessageAction;
use App\Http\Controllers\Controller;
use App\Models\HotelAdmin;
use App\Models\Message;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

class ReservationMessageController extends Controller
{
    #[OA\Get(
        path: '/api/client/reservations/{id}/messages',
        summary: 'Messages d\'une réservation',
        description: 'Retourne la conversation entre le client et l\'hôtel pour une réservation donnée.',
        tags: ['Client - Messagerie'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Messages de la réservation'),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
        ]
    )]
    public function index(Request $request, int $id): JsonResponse
    {
        $reservation = Reservation::where('client_id', $request->user()->id)->findOrFail($id);

        $messages = Message::where('reservation_id', $reservation->id)
            ->orderBy('date_envoi')
            ->get();

        Message::where('reservation_id', $reservation->id)
            ->where('destinataire_id', $request->user()->id)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json([
            'data' => $messages,
            'chat_ferme' => now()->gt($reservation->date_fin),
        ]);
    }

    #[OA\Post(
        path: '/api/client/reservations/{id}/messages',
        summary: 'Envoyer un message à l\'hôtel',
        description: 'Envoie un message à l\'hôtel concernant une réservation. Notification temps réel via WebSocket.',
        tags: ['Client - Messagerie'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['contenu'],
                properties: [
                    new OA\Property(property: 'contenu', type: 'string', example: 'Bonjour, est-il possible d\'avoir un lit bébé ?'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Message envoyé'),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function store(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'contenu' => 'required|string',
        ]);

        $reservation = Reservation::with('propriete.hotel')
            ->where('client_id', $request->user()->id)
            ->findOrFail($id);

        if (now()->gt($reservation->date_fin)) {
            return response()->json(['message' => 'Cette conversation est clôturée.'], 403);
        }

        $destinataire = HotelAdmin::where('hotel_id', $reservation->propriete->hotel_id)
            ->whereNull('date_fin')
            ->orderByDesc('est_principal')
            ->with('user')
            ->firstOrFail()
            ->user;

        $message = app(SendReservationMessageAction::class)->send(
            $reservation,
            $request->user(),
            $destinataire,
            $request->contenu
        );

        return response()->json(['message' => 'Message envoyé.', 'data' => $message], 201);
    }

    #[OA\Post(
        path: '/api/client/reservations/{id}/messages/paiement',
        summary: 'Choisir le mode de paiement du solde',
        description: 'Enregistre le mode de paiement choisi par le client suite au message de confirmation de réservation.',
        tags: ['Client - Messagerie'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['mode_paiement'],
                properties: [
                    new OA\Property(property: 'mode_paiement', type: 'string', enum: ['mobile_money', 'carte_bancaire', 'especes_arrivee']),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Choix enregistré'),
            new OA\Response(response: 403, description: 'Conversation clôturée'),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function choisirPaiement(Request $request, int $id): JsonResponse
    {
        $codes = array_column(RespondToReservationAction::MODES_PAIEMENT_DISPONIBLES, 'code');

        $validated = $request->validate([
            'mode_paiement' => ['required', Rule::in($codes)],
        ]);

        $reservation = Reservation::with('propriete.hotel')
            ->where('client_id', $request->user()->id)
            ->findOrFail($id);

        if (now()->gt($reservation->date_fin)) {
            return response()->json(['message' => 'Cette conversation est clôturée.'], 403);
        }

        $destinataire = HotelAdmin::where('hotel_id', $reservation->propriete->hotel_id)
            ->whereNull('date_fin')
            ->orderByDesc('est_principal')
            ->with('user')
            ->firstOrFail()
            ->user;

        $libelle = collect(RespondToReservationAction::MODES_PAIEMENT_DISPONIBLES)
            ->firstWhere('code', $validated['mode_paiement'])['libelle'];

        $message = app(SendReservationMessageAction::class)->send(
            $reservation,
            $request->user(),
            $destinataire,
            "Mode de paiement choisi : {$libelle}",
            Message::TYPE_CHOIX_PAIEMENT,
            ['mode_paiement' => $validated['mode_paiement']],
        );

        return response()->json(['message' => 'Choix enregistré.', 'data' => $message], 201);
    }
}
