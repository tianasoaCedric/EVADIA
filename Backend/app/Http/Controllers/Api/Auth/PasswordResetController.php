<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Email introuvable.'], 404);
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_codes')->updateOrInsert(
            ['email' => $user->email],
            [
                'code'       => $code,
                'expires_at' => now()->addMinutes(15),
                'created_at' => now(),
            ]
        );

        Mail::to($user->email)->send(new PasswordResetCode($user->prenom, $code));

        return response()->json(['message' => 'Code envoyé par email.']);
    }

    public function verifyCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $record = DB::table('password_reset_codes')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Code invalide.'], 422);
        }

        if (now()->isAfter($record->expires_at)) {
            DB::table('password_reset_codes')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Code expiré.'], 404);
        }

        return response()->json(['message' => 'Code valide.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'                 => 'required|email',
            'code'                  => 'required|string|size:6',
            'password'              => 'required|string|min:6|confirmed',
        ]);

        $record = DB::table('password_reset_codes')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Code invalide.'], 422);
        }

        if (now()->isAfter($record->expires_at)) {
            DB::table('password_reset_codes')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Code expiré.'], 404);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $user->update(['password_hash' => Hash::make($request->password)]);

        DB::table('password_reset_codes')->where('email', $request->email)->delete();

        // Révoquer tous les tokens existants pour sécuriser le compte
        $user->tokens()->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }
}
