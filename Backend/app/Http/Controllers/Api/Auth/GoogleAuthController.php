<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\AuthProvider;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Throwable $e) {
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

                $clientRole = Role::where('code', 'clients')->first();
                if ($clientRole) {
                    $user->roles()->attach($clientRole->id, [
                        'est_actif'   => true,
                        'assigned_at' => now(),
                    ]);
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

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect("{$frontendUrl}/auth/callback?token={$token}");
    }
}
