<?php

namespace App\Actions\Reservation;

use App\Models\HotelAdmin;
use App\Models\Notification;
use App\Models\Reservation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * Prévient tous les comptes actifs de l'hôtel qu'une réservation vient d'arriver.
 * La notification in-app est affichée en alerte dans le back office hôtel
 * (type `nouvelle_reservation`, voir layouts/hotel.blade.php).
 */
class NotifyHotelOfNewReservationAction
{
    public const TYPE = 'nouvelle_reservation';

    public function handle(Reservation $reservation): void
    {
        try {
            $reservation->loadMissing(['client', 'propriete', 'offre']);

            $hotelId = $reservation->propriete->hotel_id;
            $client = trim(($reservation->client?->prenom ?? '') . ' ' . ($reservation->client?->nom ?? '')) ?: 'Un client';
            $nuits = $reservation->date_debut->diffInDays($reservation->date_fin);
            $personnes = (int) $reservation->nb_adultes + (int) $reservation->nb_enfants;

            $contenu = sprintf(
                '%s — %s, du %s au %s (%d nuit%s, %d pers.)',
                $client,
                $reservation->propriete->nom,
                $reservation->date_debut->format('d/m/Y'),
                $reservation->date_fin->format('d/m/Y'),
                $nuits,
                $nuits > 1 ? 's' : '',
                $personnes,
            );

            // Réservation faite depuis une offre (ou avec son code promo) : l'hôtel doit le voir
            $titre = 'Nouvelle réservation ' . $reservation->code_reservation;
            if ($reservation->offre) {
                $titre .= ' — offre « ' . $reservation->offre->titre . ' »';
                $contenu .= sprintf(
                    ' · via l\'offre « %s » (−%s %s)',
                    $reservation->offre->titre,
                    number_format((float) $reservation->montant_reduction, 0, ',', ' '),
                    $reservation->devise_prix_total,
                );
            }

            $userIds = HotelAdmin::where('hotel_id', $hotelId)
                ->whereNull('date_fin')
                ->pluck('user_id')
                ->unique();

            foreach ($userIds as $userId) {
                Notification::create([
                    'user_id'           => $userId,
                    'type_notification' => self::TYPE,
                    'titre'             => Str::limit($titre, 250),
                    'contenu'           => $contenu,
                    'lien'              => route('hotel.reservations.show', $reservation->id, false),
                    'reservation_id'    => $reservation->id,
                    'canal'             => 'in_app',
                    'date_envoi'        => now(),
                ]);
            }
        } catch (Throwable $e) {
            // La réservation est déjà enregistrée : une notification ratée ne doit pas la faire échouer.
            Log::error('Échec notification hôtel nouvelle réservation', [
                'reservation_id' => $reservation->id,
                'error'          => $e->getMessage(),
            ]);
        }
    }
}
