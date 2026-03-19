<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Events\NewMessageSent;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use OpenApi\Attributes as OA;

class MessageController extends Controller
{
    #[OA\Get(
        path: '/api/admin/messages',
        summary: 'Liste des conversations',
        description: 'Retourne les conversations de l\'admin regroupées par interlocuteur.',
        tags: ['Admin - Messagerie'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Liste des conversations',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'data', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'interlocuteur', type: 'object', properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 5),
                                new OA\Property(property: 'nom', type: 'string', example: 'Martin'),
                                new OA\Property(property: 'prenom', type: 'string', example: 'Sophie'),
                                new OA\Property(property: 'email', type: 'string', example: 'sophie@hotel.com'),
                            ]),
                            new OA\Property(property: 'dernier_message', type: 'string', example: 'Merci pour votre réponse'),
                            new OA\Property(property: 'date', type: 'string', format: 'date-time'),
                            new OA\Property(property: 'non_lus', type: 'integer', example: 2),
                        ])),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
        ]
    )]
    public function index(): JsonResponse
    {
        $userId = auth()->id();

        $conversations = Message::where('destinataire_id', $userId)
            ->orWhere('expediteur_id', $userId)
            ->selectRaw('
                CASE WHEN expediteur_id = ? THEN destinataire_id ELSE expediteur_id END as interlocuteur_id,
                MAX(date_envoi) as dernier_message_date
            ', [$userId])
            ->groupBy('interlocuteur_id')
            ->orderByDesc('dernier_message_date')
            ->get();

        $userIds = $conversations->pluck('interlocuteur_id')->toArray();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        $unreadCounts = Message::where('destinataire_id', $userId)
            ->where('lu', false)
            ->selectRaw('expediteur_id, COUNT(*) as count')
            ->groupBy('expediteur_id')
            ->pluck('count', 'expediteur_id');

        $data = $conversations->map(function ($conv) use ($users, $unreadCounts, $userId) {
            $lastMsg = Message::where(function ($q) use ($conv, $userId) {
                $q->where('expediteur_id', $userId)->where('destinataire_id', $conv->interlocuteur_id);
            })->orWhere(function ($q) use ($conv, $userId) {
                $q->where('expediteur_id', $conv->interlocuteur_id)->where('destinataire_id', $userId);
            })->latest('date_envoi')->first();

            return [
                'interlocuteur' => $users[$conv->interlocuteur_id] ?? null,
                'dernier_message' => $lastMsg?->contenu,
                'date' => $conv->dernier_message_date,
                'non_lus' => $unreadCounts[$conv->interlocuteur_id] ?? 0,
            ];
        });

        return response()->json(['data' => $data]);
    }

    #[OA\Get(
        path: '/api/admin/messages/conversation/{userId}',
        summary: 'Messages d\'une conversation',
        description: 'Retourne tous les messages échangés avec un utilisateur. Marque les messages reçus comme lus.',
        tags: ['Admin - Messagerie'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'userId', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Messages de la conversation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'interlocuteur', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 5),
                            new OA\Property(property: 'nom', type: 'string', example: 'Martin'),
                            new OA\Property(property: 'prenom', type: 'string', example: 'Sophie'),
                        ]),
                        new OA\Property(property: 'messages', type: 'array', items: new OA\Items(type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'expediteur_id', type: 'integer', example: 1),
                            new OA\Property(property: 'contenu', type: 'string', example: 'Bonjour, comment puis-je vous aider ?'),
                            new OA\Property(property: 'sujet', type: 'string', nullable: true, example: 'Demande de renseignement'),
                            new OA\Property(property: 'lu', type: 'boolean', example: true),
                            new OA\Property(property: 'date_envoi', type: 'string', format: 'date-time'),
                        ])),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Utilisateur non trouvé'),
        ]
    )]
    public function conversation(int $userId): JsonResponse
    {
        $interlocuteur = User::findOrFail($userId);
        $myId = auth()->id();

        $messages = Message::where(function ($q) use ($userId, $myId) {
            $q->where('expediteur_id', $myId)->where('destinataire_id', $userId);
        })->orWhere(function ($q) use ($userId, $myId) {
            $q->where('expediteur_id', $userId)->where('destinataire_id', $myId);
        })->orderBy('date_envoi')->get();

        // Mark as read
        Message::where('expediteur_id', $userId)
            ->where('destinataire_id', $myId)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json([
            'interlocuteur' => $interlocuteur,
            'messages' => $messages,
        ]);
    }

    #[OA\Post(
        path: '/api/admin/messages',
        summary: 'Envoyer un message',
        description: 'Envoie un nouveau message à un utilisateur. Déclenche une notification temps réel via WebSocket.',
        tags: ['Admin - Messagerie'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['destinataire_id', 'contenu'],
                properties: [
                    new OA\Property(property: 'destinataire_id', type: 'integer', example: 5),
                    new OA\Property(property: 'sujet', type: 'string', nullable: true, example: 'Concernant votre hôtel'),
                    new OA\Property(property: 'contenu', type: 'string', example: 'Bonjour, votre demande a été traitée.'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Message envoyé', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'message', type: 'string', example: 'Message envoyé.'),
                    new OA\Property(property: 'data', type: 'object'),
                ]
            )),
            new OA\Response(response: 422, description: 'Erreur de validation'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'destinataire_id' => 'required|exists:users,id',
            'sujet' => 'nullable|string|max:255',
            'contenu' => 'required|string',
        ]);

        $message = Message::create([
            'expediteur_id' => auth()->id(),
            'destinataire_id' => $request->destinataire_id,
            'sujet' => $request->sujet,
            'contenu' => $request->contenu,
            'date_envoi' => now(),
        ]);

        Notification::create([
            'user_id' => $request->destinataire_id,
            'type_notification' => 'nouveau_message',
            'titre' => 'Nouveau message',
            'contenu' => Str::limit($request->contenu, 100),
            'lien' => '/messages/conversation/' . auth()->id(),
            'canal' => 'in_app',
            'date_envoi' => now(),
        ]);

        broadcast(new NewMessageSent($message->load('expediteur')))->toOthers();

        return response()->json(['message' => 'Message envoyé.', 'data' => $message], 201);
    }
}
