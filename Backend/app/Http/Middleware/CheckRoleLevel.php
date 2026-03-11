<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoleLevel
{
    public function handle(Request $request, Closure $next, int $maxLevel): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $minNiveau = $user->roles
            ->where('pivot.est_actif', true)
            ->min('niveau');

        if ($minNiveau === null || $minNiveau > $maxLevel) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        return $next($request);
    }
}
