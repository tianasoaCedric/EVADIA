<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuthProvider;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request): RedirectResponse
    {
        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
        $driver = Socialite::driver('google');

        // Transmettre le paramètre platform dans le state OAuth
        if ($request->query('platform') === 'mobile') {
            $driver = $driver->with(['state' => 'mobile']);
        }

        return $driver->stateless()->redirect();
    }

    public function callback(Request $request): RedirectResponse
    {
        $isMobile = $request->query('platform') === 'mobile'
            || $request->query('state') === 'mobile';

        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->stateless()->user();
        } catch (\Throwable) {
            if ($isMobile) {
                return redirect("evadia://auth/callback?error=google_failed");
            }
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect("{$frontendUrl}/login?error=google_failed");
        }

        // Cherche un compte déjà lié à ce Google ID
        $provider = AuthProvider::where('provider', 'google')
            ->where('provider_id', $googleUser->getId())
            ->first();

        if ($provider) {
            $user = $provider->user;
        } else {
            // Cherche un compte existant avec le même email
            $user = User::where('email', $googleUser->getEmail())->first();

            if (! $user) {
                // Crée un nouveau compte
                $googleData = $googleUser->user ?? [];
                $prenom = $googleData['given_name'] ?? explode(' ', $googleUser->getName())[0];
                $nom    = $googleData['family_name'] ?? (explode(' ', $googleUser->getName())[1] ?? $prenom);

                $user = User::create([
                    'nom'            => $nom,
                    'prenom'         => $prenom,
                    'email'          => $googleUser->getEmail(),
                    'avatar_url'     => $googleUser->getAvatar(),
                    'email_verified' => true,
                    'est_actif'      => true,
                    'date_inscription' => now(),
                    'updated_at'     => now(),
                ]);

                $clientRole = Role::where('code', 'client')->first();
                if ($clientRole) {
                    $user->roles()->attach($clientRole->id, [
                        'est_actif'   => true,
                        'assigned_at' => now(),
                    ]);
                } else {
                    Log::error('GoogleAuth: rôle "clients" introuvable en DB — seeder manquant ?');
                    $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
                    return redirect("{$frontendUrl}/login?error=role_missing");
                }
            }

            // Lie le compte Google à l'utilisateur
            AuthProvider::create([
                'user_id'        => $user->id,
                'provider'       => 'google',
                'provider_id'    => $googleUser->getId(),
                'provider_email' => $googleUser->getEmail(),
                'created_at'     => now(),
            ]);
        }

        $user->update(['derniere_connexion' => now()]);
        $user->load('roles');

        $token = $user->createToken('google-auth')->plainTextToken;

        if ($isMobile) {
            return redirect("evadia://auth/callback?token={$token}");
        }

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect("{$frontendUrl}/auth/callback?token={$token}");
    }
}
