<?php

namespace App\Actions\Reservation;

use App\Mail\ReservationAcceptedMail;
use App\Mail\ReservationRejectedMail;
use App\Models\Facture;
use App\Models\HotelAdmin;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Reservation;
use App\Services\ExpoPushService;
use DomainException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class RespondToReservationAction
{
    public const MODES_PAIEMENT_DISPONIBLES = [
        ['code' => 'mobile_money', 'libelle' => 'Mobile Money'],
        ['code' => 'carte_bancaire', 'libelle' => 'Carte bancaire'],
        ['code' => 'especes_arrivee', 'libelle' => 'Espèces à l\'arrivée'],
    ];

    public function __construct(
        private ExpoPushService $expoPush,
        private SendReservationMessageAction $sendMessage,
    ) {
    }

    public function accept(Reservation $reservation, int $staffUserId): Reservation
    {
        $this->assertPending($reservation);
        $this->assertDepositPaid($reservation);

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

        $this->expoPush->sendToUser(
            $reservation->client,
            'Réservation confirmée',
            "Votre réservation {$reservation->code_reservation} a été acceptée par l'hôtel.",
            ['type' => 'reservation_acceptee', 'reservation_id' => $reservation->id]
        );

        $this->sendMailSafely(function () use ($reservation) {
            Mail::to($reservation->client->email)->send(
                new ReservationAcceptedMail($reservation->fresh(['client', 'propriete.hotel']), $reservation->facture)
            );
        }, $reservation);

        $this->sendChatConfirmation($reservation);

        return $reservation->fresh();
    }

    private function sendChatConfirmation(Reservation $reservation): void
    {
        $reservation->loadMissing('propriete.hotel', 'client');

        $expediteur = HotelAdmin::where('hotel_id', $reservation->propriete->hotel_id)
            ->whereNull('date_fin')
            ->orderByDesc('est_principal')
            ->with('user')
            ->first()
            ?->user;

        if (!$expediteur) {
            return;
        }

        try {
            $recap = sprintf(
                "Votre réservation %s est confirmée !\nDu %s au %s\nMontant total : %s %s",
                $reservation->code_reservation,
                $reservation->date_debut->format('d/m/Y'),
                $reservation->date_fin->format('d/m/Y'),
                number_format((float) $reservation->prix_total, 2),
                $reservation->devise_prix_total,
            );

            $this->sendMessage->send(
                $reservation,
                $expediteur,
                $reservation->client,
                $recap,
                Message::TYPE_SYSTEME,
            );

            $this->sendMessage->send(
                $reservation,
                $expediteur,
                $reservation->client,
                'Merci de choisir votre mode de paiement pour le solde restant.',
                Message::TYPE_CHOIX_PAIEMENT,
                ['options' => self::MODES_PAIEMENT_DISPONIBLES],
            );
        } catch (Throwable $e) {
            Log::error('Échec envoi message chat confirmation réservation', [
                'reservation_id' => $reservation->id,
                'error'          => $e->getMessage(),
            ]);
        }
    }

    public function markDepositPaid(Reservation $reservation): Reservation
    {
        if ($reservation->statut_paiement_acompte !== 'en_attente') {
            throw new DomainException(
                'Aucun acompte en attente de confirmation pour cette réservation.'
            );
        }

        $reservation->update([
            'statut_paiement_acompte' => 'paye',
            'date_paiement_acompte'   => now(),
        ]);

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

        $this->expoPush->sendToUser(
            $reservation->client,
            'Réservation refusée',
            "Votre réservation {$reservation->code_reservation} a été refusée. Raison : {$raison}",
            ['type' => 'reservation_refusee', 'reservation_id' => $reservation->id]
        );

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

    private function assertDepositPaid(Reservation $reservation): void
    {
        if ($reservation->statut_paiement_acompte === 'en_attente') {
            throw new DomainException(
                "L'acompte de {$reservation->montant_acompte} {$reservation->devise_prix_total} n'a pas encore été confirmé. Marquez-le comme reçu avant d'accepter la réservation."
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
