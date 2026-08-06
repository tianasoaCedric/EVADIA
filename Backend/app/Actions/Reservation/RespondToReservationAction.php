<?php

namespace App\Actions\Reservation;

use App\Mail\ReservationAcceptedMail;
use App\Mail\ReservationRejectedMail;
use App\Models\Facture;
use App\Models\Notification;
use App\Models\Reservation;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class RespondToReservationAction
{
    public function accept(Reservation $reservation, int $staffUserId): Reservation
    {
        $this->assertPending($reservation);

        $reservation = DB::transaction(function () use ($reservation, $staffUserId) {
            $reservation->update([
                'statut'       => 'acceptee',
                'repondue_par' => $staffUserId,
                'date_reponse' => now(),
            ]);

            $facture = Facture::create([
                'reservation_id' => $reservation->id,
                'numero_facture' => $this->generateInvoiceNumber(),
                'date_emission'  => now(),
                'montant_total'  => $reservation->prix_total,
                'devise'         => $reservation->devise_prix_total,
            ]);

            $this->notifyInApp(
                $reservation,
                'reservation_acceptee',
                'Réservation confirmée',
                "Votre réservation {$reservation->code_reservation} a été acceptée par l'hôtel."
            );

            $reservation->setRelation('facture', $facture);

            return $reservation;
        });

        $this->sendMailSafely(function () use ($reservation) {
            Mail::to($reservation->client->email)->send(
                new ReservationAcceptedMail($reservation->fresh(['client', 'propriete.hotel']), $reservation->facture)
            );
        }, $reservation);

        return $reservation->fresh();
    }

    public function reject(Reservation $reservation, int $staffUserId, string $raison): Reservation
    {
        $this->assertPending($reservation);

        $reservation = DB::transaction(function () use ($reservation, $staffUserId, $raison) {
            $reservation->update([
                'statut'       => 'refusee',
                'repondue_par' => $staffUserId,
                'date_reponse' => now(),
                'raison_refus' => $raison,
            ]);

            $this->notifyInApp(
                $reservation,
                'reservation_refusee',
                'Réservation refusée',
                "Votre réservation {$reservation->code_reservation} a été refusée. Raison : {$raison}"
            );

            return $reservation;
        });

        $this->sendMailSafely(function () use ($reservation, $raison) {
            Mail::to($reservation->client->email)->send(
                new ReservationRejectedMail($reservation->fresh(['client', 'propriete.hotel']), $raison)
            );
        }, $reservation);

        return $reservation->fresh();
    }

    private function assertPending(Reservation $reservation): void
    {
        if ($reservation->statut !== 'en_attente') {
            throw new DomainException(
                'Cette réservation ne peut plus être acceptée ou refusée (statut actuel : ' . $reservation->statut . ').'
            );
        }
    }

    private function notifyInApp(Reservation $reservation, string $type, string $titre, string $contenu): void
    {
        Notification::create([
            'user_id'           => $reservation->client_id,
            'type_notification' => $type,
            'titre'             => $titre,
            'contenu'           => $contenu,
            'lien'              => '/reservations/' . $reservation->id,
            'reservation_id'    => $reservation->id,
            'canal'             => 'in_app',
            'date_envoi'        => now(),
        ]);
    }

    private function sendMailSafely(callable $send, Reservation $reservation): void
    {
        try {
            $send();
        } catch (Throwable $e) {
            Log::error('Échec envoi email réponse réservation', [
                'reservation_id' => $reservation->id,
                'error'          => $e->getMessage(),
            ]);
        }
    }

    private function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $seq  = Facture::whereYear('date_emission', $year)->count() + 1;

        return sprintf('FAC-%d-%06d', $year, $seq);
    }
}
