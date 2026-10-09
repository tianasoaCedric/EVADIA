<?php

namespace App\Mail;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReservationRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Reservation $reservation,
        public string $raison,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Votre réservation {$this->reservation->code_reservation} n'a pas pu être confirmée",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.reservation-rejected',
            with: [
                'reservation' => $this->reservation,
                'raison'      => $this->raison,
            ],
        );
    }
}
