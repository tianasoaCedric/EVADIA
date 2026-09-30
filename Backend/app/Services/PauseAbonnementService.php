<?php

namespace App\Services;

use App\Exceptions\PauseImpossibleException;
use App\Mail\AbonnementPauseMail;
use App\Models\Abonnement;
use App\Models\AbonnementPaiement;
use App\Models\AbonnementPause;
use App\Models\Reservation;
use App\Support\FrontendCache;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Pause d'abonnement, décidée par Evadia à la demande de l'hôtel. Gratuite :
 * l'hôtel est retiré du site et, à la reprise, les jours payés non utilisés
 * sont reportés sur l'échéance.
 *
 * Règles :
 *  - hôtel actif, abonnement à jour, pause qui commence au plus tard le jour de l'échéance ;
 *  - aucune réservation en attente ou acceptée pendant la pause (sinon refus + liste) ;
 *  - une seule pause planifiée ou en cours à la fois ;
 *  - la reprise ne réactive l'hôtel que si sa suspension en cours vient de la pause.
 */
class PauseAbonnementService
{
    /** Jours avant la reprise où l'hôtel est prévenu. */
    public const RAPPEL_REPRISE_JOURS = 3;

    public function __construct(private AbonnementService $abonnements)
    {
    }

    public function planifier(Abonnement $abonnement, Carbon $debut, Carbon $reprise, ?string $raison, ?int $userId): AbonnementPause
    {
        $debut = $debut->copy()->startOfDay();
        $reprise = $reprise->copy()->startOfDay();

        $pause = DB::transaction(function () use ($abonnement, $debut, $reprise, $raison, $userId) {
            // Verrou : ni la tâche quotidienne ni un autre admin ne modifient l'abonnement en même temps.
            $abonnement = Abonnement::whereKey($abonnement->id)->lockForUpdate()->firstOrFail();
            $abonnement->load('hotel.currentStatut');

            $this->verifierConditions($abonnement, $debut, $reprise);
            $this->verifierReservations($abonnement->hotel_id, $debut, $reprise);

            return AbonnementPause::create([
                'abonnement_id' => $abonnement->id,
                'hotel_id'      => $abonnement->hotel_id,
                'date_debut'    => $debut,
                'date_reprise'  => $reprise,
                'raison'        => $raison,
                'created_by'    => $userId,
            ]);
        });

        $this->abonnements->notifierAdmins(
            $pause->abonnement,
            'abonnement_pause',
            "Pause planifiée : {$pause->abonnement->hotel->nom}",
            "Du {$debut->format('d/m/Y')} au {$reprise->format('d/m/Y')} ({$pause->duree()} jours).",
        );

        if ($debut->lte(today())) {
            $this->demarrer($pause, $userId);
        } else {
            $this->abonnements->notifierHotel(
                $pause->abonnement,
                'abonnement_pause',
                'Pause planifiée',
                "Votre hôtel sera en pause du {$debut->format('d/m/Y')} au {$reprise->format('d/m/Y')}. Aucune réservation ne peut être prise pour ces dates.",
                new AbonnementPauseMail($pause, 'planifiee'),
            );
        }

        return $pause->fresh();
    }

    /** Début effectif : l'hôtel disparaît du site. */
    public function demarrer(AbonnementPause $pause, ?int $userId): void
    {
        $pause->loadMissing('abonnement.hotel');
        $abonnement = $pause->abonnement;
        $hotel = $abonnement->hotel;

        DB::transaction(function () use ($pause, $abonnement, $hotel, $userId) {
            $pause->update(['statut' => AbonnementPause::STATUT_EN_COURS]);
            $abonnement->update(['statut' => Abonnement::STATUT_PAUSE]);
            $this->abonnements->historiser($abonnement, 'pause', $userId);

            // Un hôtel déjà suspendu pour une autre raison garde cette suspension.
            if ($hotel->currentStatut()->first()?->statut === 'actif') {
                $this->abonnements->changerStatutHotel($hotel, 'suspendu', Abonnement::RAISON_PAUSE, $userId);
            }
        });

        FrontendCache::purgerHotels();

        $this->abonnements->notifierHotel(
            $abonnement,
            'abonnement_pause',
            'Votre hôtel est en pause',
            "Votre hôtel n'est plus visible sur EVADIA jusqu'au {$pause->date_reprise->format('d/m/Y')}. Vos jours d'abonnement non utilisés vous seront rendus à la reprise.",
            new AbonnementPauseMail($pause, 'debut'),
        );
    }

    /**
     * Reprise : l'hôtel réapparaît et l'échéance est reportée du nombre de jours
     * payés qui n'ont pas servi (du début de la pause à l'ancienne échéance).
     */
    public function reprendre(AbonnementPause $pause, ?int $userId, ?Carbon $dateReprise = null): void
    {
        $pause->loadMissing('abonnement.hotel');
        $abonnement = $pause->abonnement;
        $hotel = $abonnement->hotel;
        $reprise = ($dateReprise ?? today())->copy()->startOfDay();

        $reactive = DB::transaction(function () use ($pause, $abonnement, $hotel, $reprise, $userId) {
            $joursReportes = 0;

            if ($abonnement->date_fin) {
                $joursReportes = $pause->date_debut->lte($abonnement->date_fin)
                    ? (int) $pause->date_debut->diffInDays($abonnement->date_fin) + 1
                    : 0;

                // Échéance = veille de la reprise + jours non utilisés
                $nouvelleFin = $reprise->copy()->addDays($joursReportes - 1);

                if ($joursReportes > 0) {
                    AbonnementPaiement::create([
                        'abonnement_id'  => $abonnement->id,
                        'hotel_id'       => $abonnement->hotel_id,
                        'periode_debut'  => $reprise,
                        'periode_fin'    => $nouvelleFin,
                        'source'         => AbonnementPaiement::SOURCE_REPORT,
                        'enregistre_par' => $userId,
                    ]);
                }

                $abonnement->date_fin = $nouvelleFin;
            }

            $abonnement->fill(['statut' => Abonnement::STATUT_ACTIF, 'rappels_envoyes' => null])->save();
            $this->abonnements->historiser($abonnement, 'reprise', $userId);

            $pause->update([
                'statut'         => AbonnementPause::STATUT_TERMINEE,
                'date_reprise'   => $reprise,
                'jours_reportes' => $joursReportes,
                'ended_by'       => $userId,
                'ended_at'       => now(),
            ]);

            $statut = $hotel->currentStatut()->first();
            if ($statut?->statut === 'suspendu' && $statut->raison === Abonnement::RAISON_PAUSE) {
                $this->abonnements->changerStatutHotel($hotel, 'actif', 'Fin de pause', $userId);
                return true;
            }

            return false;
        });

        if ($reactive) {
            FrontendCache::purgerHotels();
        }

        $fin = $abonnement->date_fin?->format('d/m/Y');

        $this->abonnements->notifierHotel(
            $abonnement,
            'abonnement_reprise',
            'Fin de pause : votre hôtel est de nouveau en ligne',
            ($reactive ? 'Votre hôtel est de nouveau visible sur EVADIA. ' : '')
                . ($fin ? "Prochaine échéance : {$fin}." : ''),
            new AbonnementPauseMail($pause->fresh(), 'fin'),
        );

        $this->abonnements->notifierAdmins(
            $abonnement,
            'abonnement_reprise',
            "Fin de pause : {$hotel->nom}",
            "{$pause->jours_reportes} jour(s) reporté(s)." . ($fin ? " Nouvelle échéance : {$fin}." : ''),
        );
    }

    /** Prolonge ou raccourcit une pause. Une reprise à aujourd'hui (ou avant) la termine tout de suite. */
    public function modifierReprise(AbonnementPause $pause, Carbon $reprise, ?int $userId): void
    {
        $reprise = $reprise->copy()->startOfDay();

        if (!in_array($pause->statut, AbonnementPause::STATUTS_ACTIVES, true)) {
            throw new PauseImpossibleException('Cette pause est déjà terminée ou annulée.');
        }
        if ($reprise->lte($pause->date_debut)) {
            throw new PauseImpossibleException('La reprise doit être postérieure au début de la pause.');
        }

        if ($pause->statut === AbonnementPause::STATUT_EN_COURS && $reprise->lte(today())) {
            $this->reprendre($pause, $userId);
            return;
        }

        // Prolongation : les nouveaux jours ne doivent pas non plus contenir de réservation.
        if ($reprise->gt($pause->date_reprise)) {
            $this->verifierReservations($pause->hotel_id, $pause->date_reprise, $reprise);
        }

        $pause->update(['date_reprise' => $reprise, 'rappel_reprise_envoye' => false]);
    }

    public function annuler(AbonnementPause $pause, ?int $userId): void
    {
        if ($pause->statut !== AbonnementPause::STATUT_PLANIFIEE) {
            throw new PauseImpossibleException('Seule une pause qui n\'a pas encore commencé peut être annulée. Sinon, utilisez « Reprendre maintenant ».');
        }

        $pause->update(['statut' => AbonnementPause::STATUT_ANNULEE, 'ended_by' => $userId, 'ended_at' => now()]);
    }

    /**
     * Tâche quotidienne : démarre les pauses du jour, prévient avant la reprise,
     * termine les pauses arrivées à échéance.
     *
     * @return array{debuts:int, rappels:int, reprises:int}
     */
    public function traiterPauses(): array
    {
        $stats = ['debuts' => 0, 'rappels' => 0, 'reprises' => 0];
        $aujourdhui = today();

        $pauses = AbonnementPause::active()->with('abonnement.hotel')->get();

        foreach ($pauses as $pause) {
            try {
                if ($pause->statut === AbonnementPause::STATUT_PLANIFIEE && $pause->date_debut->lte($aujourdhui)) {
                    $this->demarrer($pause, null);
                    $stats['debuts']++;
                    $pause->refresh();
                }

                if ($pause->statut !== AbonnementPause::STATUT_EN_COURS) {
                    continue;
                }

                if ($pause->date_reprise->lte($aujourdhui)) {
                    // Date prévue et non date du jour : un passage manqué ne coûte rien à l'hôtel.
                    $this->reprendre($pause, null, $pause->date_reprise);
                    $stats['reprises']++;
                } elseif (!$pause->rappel_reprise_envoye
                    && $aujourdhui->diffInDays($pause->date_reprise) <= self::RAPPEL_REPRISE_JOURS) {
                    $this->abonnements->notifierHotel(
                        $pause->abonnement,
                        'abonnement_pause',
                        'Reprise le ' . $pause->date_reprise->format('d/m/Y'),
                        'Votre hôtel redevient visible sur EVADIA le ' . $pause->date_reprise->format('d/m/Y') . '. Vérifiez vos tarifs et disponibilités.',
                        new AbonnementPauseMail($pause, 'rappel'),
                    );
                    $pause->update(['rappel_reprise_envoye' => true]);
                    $stats['rappels']++;
                }
            } catch (Throwable $e) {
                Log::error('Pause abonnement : traitement impossible', [
                    'pause_id' => $pause->id,
                    'error'    => $e->getMessage(),
                ]);
            }
        }

        return $stats;
    }

    /**
     * Réservations en attente ou acceptées qui occupent au moins une nuit de
     * [debut, reprise[ dans l'hôtel.
     */
    public function reservationsBloquantes(int $hotelId, Carbon $debut, Carbon $reprise): Collection
    {
        return Reservation::with(['client:id,nom,prenom', 'propriete:id,nom,hotel_id'])
            ->whereHas('propriete', fn($q) => $q->where('hotel_id', $hotelId))
            ->whereIn('statut', DisponibiliteService::STATUTS_OCCUPANTS)
            ->where('date_debut', '<', $reprise->toDateString())
            ->where('date_fin', '>', $debut->toDateString())
            ->orderBy('date_debut')
            ->get();
    }

    /** Pauses planifiées ou en cours qui chevauchent le séjour [debut, fin[. */
    public function pauseSurSejour(int $hotelId, Carbon $debut, Carbon $fin): ?AbonnementPause
    {
        return AbonnementPause::active()
            ->where('hotel_id', $hotelId)
            ->where('date_debut', '<', $fin->toDateString())
            ->where('date_reprise', '>', $debut->toDateString())
            ->first();
    }

    /** Jours de pause (terminées, en cours ou planifiées) sur les 12 derniers mois. */
    public function joursDePauseSur12Mois(int $hotelId): int
    {
        $depuis = today()->subYear();

        return (int) AbonnementPause::where('hotel_id', $hotelId)
            ->where('statut', '!=', AbonnementPause::STATUT_ANNULEE)
            ->where('date_reprise', '>', $depuis)
            ->get()
            ->sum(fn(AbonnementPause $p) => $p->date_debut->max($depuis)->diffInDays($p->date_reprise));
    }

    private function verifierConditions(Abonnement $abonnement, Carbon $debut, Carbon $reprise): void
    {
        if ($debut->lt(today())) {
            throw new PauseImpossibleException('La pause ne peut pas commencer dans le passé.');
        }
        if ($reprise->lte($debut)) {
            throw new PauseImpossibleException('La date de reprise doit être postérieure au début de la pause.');
        }
        if ($abonnement->hotel?->currentStatut?->statut !== 'actif') {
            throw new PauseImpossibleException('Seul un hôtel actif peut être mis en pause.');
        }
        if ($abonnement->statut !== Abonnement::STATUT_ACTIF) {
            throw new PauseImpossibleException('L\'abonnement doit être à jour : enregistrez d\'abord le paiement en retard.');
        }
        // Sur les dates et pas seulement le statut : la tâche quotidienne passe à 6 h.
        if ($abonnement->date_fin && $abonnement->date_fin->lt(today())) {
            throw new PauseImpossibleException('L\'échéance de l\'abonnement est dépassée : enregistrez d\'abord le paiement.');
        }
        if ($abonnement->date_fin && $debut->gt($abonnement->date_fin)) {
            throw new PauseImpossibleException('La pause doit commencer au plus tard le jour de l\'échéance (' . $abonnement->date_fin->format('d/m/Y') . ').');
        }
        if (AbonnementPause::active()->where('hotel_id', $abonnement->hotel_id)->exists()) {
            throw new PauseImpossibleException('Cet hôtel a déjà une pause planifiée ou en cours.');
        }
    }

    private function verifierReservations(int $hotelId, Carbon $debut, Carbon $reprise): void
    {
        $reservations = $this->reservationsBloquantes($hotelId, $debut, $reprise);

        if ($reservations->isNotEmpty()) {
            throw new PauseImpossibleException(
                "Pause impossible : {$reservations->count()} réservation(s) en attente ou acceptée(s) sur cette période. L'hôtel doit d'abord les traiter, ou choisissez d'autres dates.",
                $reservations,
            );
        }
    }
}
