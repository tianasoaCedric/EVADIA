<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Canal privé des messages reçus par un utilisateur, quel que soit l'endroit
// d'où il écoute : back office Evadia (guard web), back office hôtel (guard hotel),
// site client et apps mobiles (token Sanctum).
Broadcast::channel('messages.{userId}', function ($user, $userId) {
    if ((int) $user->id === (int) $userId) {
        return true;
    }

    // Un même navigateur peut être connecté aux deux back offices (session partagée) :
    // le premier guard trouvé n'est pas forcément celui de la page qui écoute.
    return request()->hasSession()
        && in_array((int) $userId, [(int) Auth::guard('web')->id(), (int) Auth::guard('hotel')->id()], true);
}, ['guards' => ['web', 'hotel', 'sanctum']]);
