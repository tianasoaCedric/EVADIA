<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForcePasswordChange
{
    /**
     * If the user has force_password_change = true,
     * redirect them to the password change page.
     * Except if they are already on that page.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->force_password_change) {
            // Allow access to the password change route and logout
            $allowedRoutes = [
                'hotel.password.change',
                'hotel.password.update',
                'logout',
            ];

            if (!in_array($request->route()?->getName(), $allowedRoutes)) {
                return redirect()->route('hotel.password.change')
                    ->with('warning', 'Vous devez modifier votre mot de passe avant de continuer.');
            }
        }

        return $next($request);
    }
}
