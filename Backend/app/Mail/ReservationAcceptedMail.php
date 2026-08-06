<?php

namespace App\Mail;

use App\Models\Facture;
use App\Models\Reservation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationAcceptedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Reservation $reservation,
        public Facture $facture,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Votre réservation {$this->reservation->code_reservation} est confirmée",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.reservation-accepted',
            with: [
                'reservation' => $this->reservation,
                'facture'     => $this->facture,
            ],
        );
    }

    public function attachments(): array
    {
        $reservation = $this->reservation;
        $facture     = $this->facture;

        return [
            Attachment::fromData(
                fn () => Pdf::loadView('pdf.facture', ['reservation' => $reservation, 'facture' => $facture])->output(),
                "facture-{$this->facture->numero_facture}.pdf"
            )->withMime('application/pdf'),
        ];
    }
}
