<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('messages.' . $this->message->destinataire_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'expediteur_id' => $this->message->expediteur_id,
            'destinataire_id' => $this->message->destinataire_id,
            // Messages liés à une réservation (chat client ↔ hôtel) : permet à l'écran
            // ouvert de savoir quelle conversation rafraîchir.
            'reservation_id' => $this->message->reservation_id,
            'type' => $this->message->type,
            'expediteur_nom' => $this->message->expediteur?->full_name,
            'sujet' => $this->message->sujet,
            'contenu' => $this->message->contenu,
            'date_envoi' => $this->message->date_envoi?->toISOString(),
        ];
    }
}
