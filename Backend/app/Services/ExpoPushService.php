<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ExpoPushService
{
    private const ENDPOINT = 'https://exp.host/--/api/v2/push/send';

    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = $user->deviceTokens()->pluck('expo_push_token')->all();

        if (empty($tokens)) {
            return;
        }

        $this->send($tokens, $title, $body, $data);
    }

    private function send(array $tokens, string $title, string $body, array $data): void
    {
        $messages = array_map(fn(string $token) => [
            'to'    => $token,
            'title' => $title,
            'body'  => $body,
            'data'  => $data,
            'sound' => 'default',
        ], $tokens);

        try {
            Http::post(self::ENDPOINT, $messages);
        } catch (Throwable $e) {
            Log::error('Échec envoi notification push Expo', ['error' => $e->getMessage()]);
        }
    }
}
