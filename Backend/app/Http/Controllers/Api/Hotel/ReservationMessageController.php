<?php

namespace App\Http\Controllers\Api\Hotel;

use App\Actions\Reservation\SendReservationMessageAction;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Message;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ReservationMessageController extends Controller
{
    use BelongsToHotel;

    #[OA\Get(
        path: '/api/hotel/reservations/{id}/messages',
        summary: 'Messages d\'une réservation',
        description: 'Retourne la conversation entre l\'hôtel et le client pour une réservation donnée.',
        tags: ['Hôtel - Messagerie'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Messages de la réservation'),
            new OA\Response(response: 404, description: 'Réservation non trouvée'),
        ]
    )]
    public function index(int $id): JsonResponse
    {
        $hotel = $this->getHotel();
        $reservation = Reservation::whereIn('propriete_id', $hotel->proprietes()->pluck('id'))->findOrFail($id);

        $messages = Message::where('reservation_id', $reservation->id)
            ->orderBy('date_envoi')
            ->get();

        Message::where('reservation_id', $reservation->id)
            ->where('destinataire_id', auth()->id())
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json([
            'data' => $messages,
            'chat_ferme' => now()->gt($reservation->date_fin),
        ]);
    }

    #[OA\Post(
        path: '/api/hotel/reservations/{id}/messages',
        summary: 'Envoyer un message au client',
        description: 'Envoie un message au client concernant sa réservation. Notification temps réel via WebSocket.',
        tags: ['Hôtel - Messagerie'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['contenu'],
                properties: [
                    new OA\Property(property: 'contenu', type: 'string', example: 'Bonjour, oui c\'est possible, sans supplément.'),
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

        $hotel = $this->getHotel();
        $reservation = Reservation::with('client')
            ->whereIn('propriete_id', $hotel->proprietes()->pluck('id'))
            ->findOrFail($id);

        if (now()->gt($reservation->date_fin)) {
            return response()->json(['message' => 'Cette conversation est clôturée.'], 403);
        }

        $message = app(SendReservationMessageAction::class)->send(
            $reservation,
            auth()->user(),
            $reservation->client,
            $request->contenu
        );

        return response()->json(['message' => 'Message envoyé.', 'data' => $message], 201);
    }
}
