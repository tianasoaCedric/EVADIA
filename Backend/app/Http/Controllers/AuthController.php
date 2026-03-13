<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\ProfilClient;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // ─── Login ─────────────────────────────────────────

    public function showLogin()
    {
        if (Auth::check()) {
            return $this->redirectByRole(Auth::user());
        }

        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $remember = $request->boolean('remember');

        if (!Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $remember)) {
            return back()->withErrors([
                'email' => 'Les identifiants fournis sont incorrects.',
            ])->onlyInput('email');
        }

        $user = Auth::user();

        // Check if email is verified
        if (!$user->email_verified) {
            Auth::logout();
            return back()->withErrors([
                'email' => 'Veuillez vérifier votre adresse email avant de vous connecter.',
            ])->onlyInput('email');
        }

        // Check if account is active
        if (!$user->est_actif) {
            Auth::logout();
            return back()->withErrors([
                'email' => 'Votre compte a été désactivé. Contactez le support.',
            ])->onlyInput('email');
        }

        // Update last connection
        $user->update(['derniere_connexion' => now()]);

        $request->session()->regenerate();

        return $this->redirectByRole($user);
    }

    // ─── Register ──────────────────────────────────────

    public function showRegister()
    {
        return view('auth.register');
    }

    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'email_verified' => false,
        ]);

        // Create client profile
        ProfilClient::create(['user_id' => $user->id]);

        // Assign client role
        $clientRole = Role::where('code', 'client')->first();
        if ($clientRole) {
            $user->roles()->attach($clientRole->id, [
                'assigned_at' => now(),
                'est_actif' => true,
            ]);
        }

        // Send email verification
        // $user->sendEmailVerificationNotification();

        return redirect()->route('login')
            ->with('success', 'Inscription réussie ! Veuillez vérifier votre email.');
    }

    // ─── Logout ────────────────────────────────────────

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    // ─── Forgot Password ──────────────────────────────

    public function showForgotPassword()
    {
        return view('auth.forgot-password');
    }

    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? back()->with('success', 'Un lien de réinitialisation a été envoyé à votre adresse email.')
            : back()->withErrors(['email' => __($status)]);
    }

    // ─── Reset Password ───────────────────────────────

    public function showResetPassword(string $token)
    {
        return view('auth.reset-password', ['token' => $token]);
    }

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
            ? redirect()->route('login')->with('success', 'Mot de passe réinitialisé avec succès.')
            : back()->withErrors(['email' => [__($status)]]);
    }

    // ─── Email Verification ───────────────────────────

    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (hash_equals(sha1($user->getEmailForVerification()), $hash)) {
            $user->update(['email_verified' => true]);

            return redirect()->route('login')
                ->with('success', 'Email vérifié avec succès ! Vous pouvez maintenant vous connecter.');
        }

        return redirect()->route('login')
            ->withErrors(['email' => 'Le lien de vérification est invalide.']);
    }

    // ─── Helpers ──────────────────────────────────────

    protected function redirectByRole(User $user)
    {
        $topRole = $user->roles()
            ->wherePivot('est_actif', true)
            ->orderByDesc('niveau')
            ->first();

        if (!$topRole) {
            Auth::logout();
            return redirect()->route('login')->withErrors([
                'email' => 'Aucun rôle attribué à votre compte.',
            ]);
        }

        return match ($topRole->code) {
            'super_admin', 'admin_evadia' => redirect()->route('admin.dashboard'),
            'admin_hotel', 'gestionnaire_hotel' => redirect('/hotel/dashboard'),
            'client' => redirect('/'),
            default => redirect('/'),
        };
    }
}
