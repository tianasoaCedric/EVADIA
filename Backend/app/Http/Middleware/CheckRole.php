<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Allowed role codes
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Non authentifié.'], 401);
            }
            return redirect(str_starts_with($request->path(), 'hotel') ? route('hotel.login') : route('login'));
        }

        $userRoles = $user->roles
            ->filter(fn ($role) => (bool) $role->pivot->est_actif)
            ->pluck('code')
            ->toArray();

        foreach ($roles as $role) {
            if (in_array($role, $userRoles)) {
                return $next($request);
            }
        }

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        abort(403, 'Vous n\'avez pas les permissions nécessaires pour accéder à cette page.');
    }
}
