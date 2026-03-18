<?php

namespace App\Mail;

use App\Models\Hotel;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class HotelAdminCredentials extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $adminUser,
        public Hotel $hotel,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenue sur EVADIA – Vos identifiants d\'accès',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.hotel-admin-credentials',
            with: [
                'adminUser' => $this->adminUser,
                'hotel' => $this->hotel,
                'loginUrl' => url('/login'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
