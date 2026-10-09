<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Coupe immédiatement l'accès d'un compte désactivé (users.est_actif = false),
 * quelle que soit la façon dont il est connecté :
 *  - back office Evadia (guard `web`) et back office hôtel (guard `hotel`) : session
 *  - site client, apps mobiles, API : token Sanctum (Bearer)
 *
 * La connexion vérifie déjà est_actif ; ce middleware couvre les sessions et
 * tokens ouverts AVANT la désactivation.
 */
class EnsureUserIsActive
{
    private const MESSAGE = 'Votre compte a été désactivé. Contactez l\'équipe Evadia.';

    public function handle(Request $request, Closure $next): Response
    {
        // Sessions des back offices (le groupe `api` n'a pas de session).
        // Les deux guards partagent le même cookie de session : un navigateur peut être
        // connecté à la fois en admin Evadia et en hôtelier. On ne déconnecte que le
        // guard du compte désactivé, sans toucher à l'autre.
        if ($request->hasSession()) {
            $guards = ['web' => 'login', 'hotel' => 'hotel.login'];
            $zone = str_starts_with($request->path(), 'hotel-admin') ? 'hotel' : 'web';
            $bloque = null;
            $deconnecte = false;

            foreach ($guards as $guard => $loginRoute) {
                $user = Auth::guard($guard)->user();
                if ($user && !$user->est_actif) {
                    Auth::guard($guard)->logout();   // retire uniquement la clé de ce guard
                    $deconnecte = true;
                    if ($guard === $zone) {
                        $bloque = $loginRoute;
                    }
                }
            }

            // Plus personne de connecté dans cette session : on la détruit entièrement.
            if ($deconnecte && !Auth::guard('web')->check() && !Auth::guard('hotel')->check()) {
                $request->session()->invalidate();
                $request->session()->regenerateToken();
            }

            // Redirection seulement si la page demandée appartient au compte désactivé.
            if ($bloque) {
                return $request->expectsJson()
                    ? response()->json(['message' => self::MESSAGE], 401)
                    : redirect()->route($bloque)->withErrors(['email' => self::MESSAGE]);
            }
        }

        // Tokens API (site client via proxy Next, mobile, clients API)
        if ($request->bearerToken()) {
            $user = Auth::guard('sanctum')->user();
            if ($user && !$user->est_actif) {
                $user->currentAccessToken()?->delete();

                return response()->json(['message' => self::MESSAGE], 401);
            }
        }

        return $next($request);
    }
}
