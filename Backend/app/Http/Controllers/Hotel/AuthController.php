<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Models\HotelAdmin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    /**
     * Show the hotel login form.
     */
    public function showLogin()
    {
        if (Auth::check()) {
            $user = Auth::user();
            $hasHotelRole = $user->roles()->whereIn('code', ['admin_hotel', 'gestionnaire_hotel'])->exists();
            if ($hasHotelRole) {
                return redirect()->route('hotel.dashboard');
            }
        }

        return view('hotel.auth.login');
    }

    /**
     * Handle hotel login.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $request->boolean('remember'))) {
            return back()->withErrors([
                'email' => 'Les identifiants fournis sont incorrects.',
            ])->onlyInput('email');
        }

        $user = Auth::user();

        // Check hotel role
        $hasHotelRole = $user->roles()->whereIn('code', ['admin_hotel', 'gestionnaire_hotel'])->exists();
        if (!$hasHotelRole) {
            Auth::logout();
            return back()->withErrors(['email' => 'Accès non autorisé à ce back-office.'])->onlyInput('email');
        }

        // Check hotel assignment
        $hasHotel = HotelAdmin::where('user_id', $user->id)->whereNull('date_fin')->exists();
        if (!$hasHotel) {
            Auth::logout();
            return back()->withErrors(['email' => 'Aucun hôtel associé à ce compte.'])->onlyInput('email');
        }

        // Check if account is active
        if (!$user->est_actif) {
            Auth::logout();
            return back()->withErrors(['email' => 'Votre compte a été désactivé. Contactez le support.'])->onlyInput('email');
        }

        // Update last connection
        $user->update(['derniere_connexion' => now()]);

        $request->session()->regenerate();

        return redirect()->route('hotel.dashboard');
    }

    /**
     * Logout hotel user.
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('hotel.login');
    }

    /**
     * Show forgot password form.
     */
    public function showForgotPassword()
    {
        return view('hotel.auth.forgot-password');
    }

    /**
     * Send reset link.
     */
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'Un lien de réinitialisation a été envoyé à votre adresse email.')
            : back()->withErrors(['email' => __($status)]);
    }

    /**
     * Show reset password form.
     */
    public function showResetPassword(string $token)
    {
        return view('hotel.auth.reset-password', ['token' => $token]);
    }

    /**
     * Reset password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->update([
                    'password_hash' => Hash::make($password),
                ]);
            }
        );

        return $status === Password::PASSWORD_RESET
            ? redirect()->route('hotel.login')->with('success', 'Mot de passe réinitialisé avec succès.')
            : back()->withErrors(['email' => [__($status)]]);
    }
}
