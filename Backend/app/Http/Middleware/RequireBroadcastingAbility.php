<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireBroadcastingAbility
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();

        if ($token && method_exists($token, 'can') && !$token->can('broadcasting')) {
            abort(403, 'Ce token ne permet pas l\'authentification WebSocket.');
        }

        return $next($request);
    }
}
