<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class BroadcastingTokenController extends Controller
{
    private const TTL_MINUTES = 10;

    #[OA\Post(
        path: '/api/client/broadcasting-token',
        summary: 'Jeton temporaire pour l\'authentification WebSocket',
        description: 'Génère un token Sanctum à courte durée de vie, restreint à l\'ability "broadcasting", utilisé uniquement pour authentifier la connexion WebSocket (Reverb) depuis le navigateur. Ne remplace pas le token de session principal.',
        tags: ['Client - Messagerie'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(response: 201, description: 'Token généré', content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'token', type: 'string'),
                    new OA\Property(property: 'expires_at', type: 'string', format: 'date-time'),
                ]
            )),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $expiresAt = now()->addMinutes(self::TTL_MINUTES);

        $token = $request->user()->createToken(
            'broadcasting-' . now()->timestamp,
            ['broadcasting'],
            $expiresAt,
        );

        return response()->json([
            'token' => $token->plainTextToken,
            'expires_at' => $expiresAt->toISOString(),
        ], 201);
    }
}
