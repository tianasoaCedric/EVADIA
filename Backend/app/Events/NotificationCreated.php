<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Notification in-app créée pour un utilisateur (réservation acceptée / refusée,
 * nouveau message…) : allume le voyant de notification du site client en direct.
 */
class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    // Les notifications sont souvent créées dans une transaction (acceptation
    // d'une réservation) : on ne diffuse qu'une fois les données visibles.
    public bool $afterCommit = true;

    public function __construct(
        public Notification $notification,
    ) {}

    public function broadcastOn(): array
    {
        // Même canal privé que la messagerie : déjà autorisé pour le site client,
        // les apps mobiles et les back offices.
        return [
            new PrivateChannel('messages.' . $this->notification->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type_notification' => $this->notification->type_notification,
            'titre' => $this->notification->titre,
            'contenu' => $this->notification->contenu,
            'lien' => $this->notification->lien,
            'reservation_id' => $this->notification->reservation_id,
            'lu' => false,
            'date_envoi' => $this->notification->date_envoi?->toISOString(),
        ];
    }
}
