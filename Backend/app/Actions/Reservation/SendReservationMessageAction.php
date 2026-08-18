<?php

namespace App\Actions\Reservation;

use App\Events\NewMessageSent;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Str;

class SendReservationMessageAction
{
    public function send(
        Reservation $reservation,
        User $expediteur,
        User $destinataire,
        string $contenu,
        string $type = Message::TYPE_TEXTE,
        ?array $metadata = null,
    ): Message {
        $message = Message::create([
            'expediteur_id'   => $expediteur->id,
            'destinataire_id' => $destinataire->id,
            'reservation_id'  => $reservation->id,
            'type'            => $type,
            'sujet'           => 'Réservation ' . $reservation->code_reservation,
            'contenu'         => $contenu,
            'metadata'        => $metadata,
            'date_envoi'      => now(),
        ]);

        Notification::create([
            'user_id'           => $destinataire->id,
            'type_notification' => 'nouveau_message_reservation',
            'titre'             => 'Nouveau message — Réservation ' . $reservation->code_reservation,
            'contenu'           => Str::limit($contenu, 100),
            'lien'              => '/reservations/' . $reservation->id,
            'reservation_id'    => $reservation->id,
            'canal'             => 'in_app',
            'date_envoi'        => now(),
        ]);

        broadcast(new NewMessageSent($message->load('expediteur')))->toOthers();

        return $message;
    }
}
