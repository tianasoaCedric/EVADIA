<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\DeviceToken;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class NotificationController extends Controller
{
    #[OA\Get(
        path: '/api/client/notifications',
        summary: 'Mes notifications',
        description: 'Retourne les notifications in-app du client, les plus récentes en premier.',
        tags: ['Client - Notifications'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Liste des notifications'),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function index(): JsonResponse
    {
        $notifications = Notification::inApp()
            ->where('user_id', auth()->id())
            ->latest('date_envoi')
            ->limit(50)
            ->get();

        return response()->json(['data' => $notifications]);
    }

    #[OA\Get(
        path: '/api/client/notifications/unread-count',
        summary: 'Nombre de notifications non lues',
        tags: ['Client - Notifications'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Compteur de notifications non lues'),
        ]
    )]
    public function unreadCount(): JsonResponse
    {
        $count = Notification::inApp()
            ->where('user_id', auth()->id())
            ->nonLu()
            ->count();

        return response()->json(['count' => $count]);
    }

    #[OA\Patch(
        path: '/api/client/notifications/{id}/read',
        summary: 'Marquer une notification comme lue',
        tags: ['Client - Notifications'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Notification marquée comme lue'),
            new OA\Response(response: 404, description: 'Notification non trouvée'),
        ]
    )]
    public function markRead(int $id): JsonResponse
    {
        $notification = Notification::where('user_id', auth()->id())->findOrFail($id);

        if (!$notification->lu) {
            $notification->update(['lu' => true, 'date_lecture' => now()]);
        }

        return response()->json(['message' => 'Notification marquée comme lue.']);
    }

    #[OA\Patch(
        path: '/api/client/notifications/read-all',
        summary: 'Marquer toutes les notifications comme lues',
        tags: ['Client - Notifications'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Toutes les notifications ont été marquées comme lues'),
        ]
    )]
    public function markAllRead(): JsonResponse
    {
        Notification::where('user_id', auth()->id())
            ->nonLu()
            ->update(['lu' => true, 'date_lecture' => now()]);

        return response()->json(['message' => 'Toutes les notifications ont été marquées comme lues.']);
    }

    #[OA\Post(
        path: '/api/client/notifications/device-token',
        summary: 'Enregistrer le token push Expo de l\'appareil',
        description: 'Associe un token de notification push Expo au compte connecté, pour recevoir des notifications push natives.',
        tags: ['Client - Notifications'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['expo_push_token'],
                properties: [
                    new OA\Property(property: 'expo_push_token', type: 'string', example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'),
                    new OA\Property(property: 'platform', type: 'string', example: 'ios'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Token enregistré'),
        ]
    )]
    public function registerDeviceToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expo_push_token' => 'required|string',
            'platform'        => 'nullable|string|max:20',
        ]);

        DeviceToken::updateOrCreate(
            ['expo_push_token' => $validated['expo_push_token']],
            ['user_id' => auth()->id(), 'platform' => $validated['platform'] ?? null]
        );

        return response()->json(['message' => 'Token enregistré.']);
    }

    #[OA\Delete(
        path: '/api/client/notifications/device-token',
        summary: 'Retirer le token push Expo de l\'appareil (déconnexion)',
        tags: ['Client - Notifications'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['expo_push_token'],
                properties: [
                    new OA\Property(property: 'expo_push_token', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Token retiré'),
        ]
    )]
    public function unregisterDeviceToken(Request $request): JsonResponse
    {
        $validated = $request->validate(['expo_push_token' => 'required|string']);

        DeviceToken::where('user_id', auth()->id())
            ->where('expo_push_token', $validated['expo_push_token'])
            ->delete();

        return response()->json(['message' => 'Token retiré.']);
    }
}
