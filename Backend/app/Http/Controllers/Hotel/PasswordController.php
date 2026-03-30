<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class PasswordController extends Controller
{
    public function showChangeForm()
    {
        return view('hotel.password.change');
    }

    public function change(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/',
                'not_in:0000',
            ],
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial.',
            'password.not_in' => 'Vous ne pouvez pas réutiliser le mot de passe temporaire.',
            'current_password.required' => 'Veuillez saisir votre mot de passe actuel.',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password_hash)) {
            return back()->withErrors([
                'current_password' => 'Le mot de passe actuel est incorrect.',
            ]);
        }

        $user->update([
            'password_hash' => Hash::make($request->password),
            'force_password_change' => false,
        ]);

        return redirect('/hotel/dashboard')
            ->with('success', 'Mot de passe modifié avec succès.');
    }
}
