<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function edit()
    {
        $user = auth()->user();
        $hotel = $this->getHotel();
        return view('hotel.profile.edit', compact('user', 'hotel'));
    }

    public function update(Request $request)
    {
        $request->validate([
            'nom' => 'required|max:100',
            'prenom' => 'required|max:100',
            'telephone' => 'nullable|max:20',
            'avatar' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();
        $data = $request->only(['nom', 'prenom', 'telephone']);

        if ($request->hasFile('avatar')) {
            if ($user->avatar_url) {
                Storage::disk('s3')->delete($user->avatar_url);
            }
            $data['avatar_url'] = $request->file('avatar')->store('avatars', 's3');
        }

        $user->update($data);
        $this->logAction('profile_updated', "Profil mis à jour par {$user->prenom} {$user->nom}");

        return back()->with('success', 'Profil mis à jour avec succès.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => [
                'required',
                function ($attr, $value, $fail) {
                    if (!Hash::check($value, auth()->user()->password_hash)) {
                        $fail('Le mot de passe actuel est incorrect.');
                    }
                }
            ],
            'password' => 'required|min:8|confirmed|regex:/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])/',
        ], [
            'password.regex' => 'Le mot de passe doit contenir au moins une majuscule, un chiffre et un caractère spécial.',
        ]);

        auth()->user()->update(['password_hash' => Hash::make($request->password)]);
        $this->logAction('password_changed', 'Mot de passe modifié');

        return back()->with('success', 'Mot de passe modifié avec succès.');
    }
}
