<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetCode extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $prenom,
        public string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Réinitialisation de votre mot de passe – Evadia',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.password-reset-code',
            with: [
                'prenom' => $this->prenom,
                'code'   => $this->code,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
