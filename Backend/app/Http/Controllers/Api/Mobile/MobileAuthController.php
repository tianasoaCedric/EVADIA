<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('roles')->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if (! $user->est_actif) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte est désactivé.'],
            ]);
        }

        $isClient = $user->roles->contains('code', 'client');
        if (! $isClient) {
            return response()->json(['message' => 'Ce compte n\'est pas un compte client.'], 403);
        }

        $user->update(['derniere_connexion' => now()]);

        // Révoque les anciens tokens mobile pour éviter l'accumulation
        $user->tokens()->where('name', 'mobile')->delete();
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'nom'                  => 'required|string|max:100',
            'prenom'               => 'required|string|max:100',
            'email'                => 'required|email|unique:users,email',
            'password'             => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'nom'              => $request->nom,
            'prenom'           => $request->prenom,
            'email'            => $request->email,
            'password_hash'    => Hash::make($request->password),
            'est_actif'        => true,
            'email_verified'   => false,
            'date_inscription' => now(),
            'updated_at'       => now(),
        ]);

        $clientRole = Role::where('code', 'client')->first();
        if ($clientRole) {
            $user->roles()->attach($clientRole->id, [
                'est_actif'   => true,
                'assigned_at' => now(),
            ]);
        }

        $user->load('roles');
        $token = $user->createToken('mobile')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('roles'),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->where('name', 'mobile')->delete();

        return response()->json(['message' => 'Toutes les sessions mobiles ont été fermées.']);
    }
}
