<?php

namespace App\Mail;

use App\Models\AbonnementPause;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email à l'hôtel autour d'une pause d'abonnement.
 * $etape : planifiee, debut, rappel (J-3 avant la reprise) ou fin.
 */
class AbonnementPauseMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AbonnementPause $pause,
        public string $etape,
    ) {
    }

    public function envelope(): Envelope
    {
        $reprise = $this->pause->date_reprise->format('d/m/Y');

        $sujet = match ($this->etape) {
            'planifiee' => 'Pause de votre hôtel planifiée sur EVADIA',
            'debut'     => "Votre hôtel est en pause sur EVADIA jusqu'au {$reprise}",
            'rappel'    => "Votre hôtel redevient visible sur EVADIA le {$reprise}",
            default     => 'Votre hôtel est de nouveau en ligne sur EVADIA',
        };

        return new Envelope(subject: $sujet);
    }

    public function content(): Content
    {
        $this->pause->loadMissing('abonnement.hotel');

        return new Content(
            markdown: 'emails.abonnement-pause',
            with: [
                'pause'      => $this->pause,
                'abonnement' => $this->pause->abonnement,
                'hotel'      => $this->pause->abonnement->hotel,
                'etape'      => $this->etape,
            ],
        );
    }
}
