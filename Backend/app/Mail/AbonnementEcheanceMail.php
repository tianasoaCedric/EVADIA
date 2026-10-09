<?php

namespace App\Mail;

use App\Models\Abonnement;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Email envoyé à l'hôtel au fil de l'échéance de son abonnement.
 * $etape : rappel (J-7 / J-1), retard (échéance passée) ou suspension (J+7).
 */
class AbonnementEcheanceMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Abonnement $abonnement,
        public string $etape,
    ) {
    }

    public function envelope(): Envelope
    {
        $sujet = match ($this->etape) {
            'retard'     => 'Votre abonnement EVADIA a expiré : paiement en attente',
            'suspension' => 'Votre hôtel a été suspendu sur EVADIA (abonnement impayé)',
            default      => 'Votre abonnement EVADIA expire le ' . $this->abonnement->date_fin->format('d/m/Y'),
        };

        return new Envelope(subject: $sujet);
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.abonnement-echeance',
            with: [
                'abonnement' => $this->abonnement,
                'hotel'      => $this->abonnement->hotel,
                'etape'      => $this->etape,
                'suspension' => $this->abonnement->dateSuspensionPrevue(),
            ],
        );
    }
}
