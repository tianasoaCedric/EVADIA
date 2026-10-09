<?php

namespace App\Services;

use App\Mail\AbonnementEcheanceMail;
use App\Models\Abonnement;
use App\Models\AbonnementHistorique;
use App\Models\AbonnementPaiement;
use App\Models\AbonnementPause;
use App\Models\Hotel;
use App\Models\HotelAdmin;
use App\Models\HotelStatut;
use App\Models\Notification;
use App\Models\User;
use App\Support\FrontendCache;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Cycle de vie d'un abonnement impayé :
 *   J-7, J-1 : rappels à l'hôtel (email + back office)
 *   échéance passée : l'abonnement passe « en retard », l'équipe Evadia est prévenue
 *   J+7 : suspension automatique de l'hôtel (raison « Abonnement impayé »)
 *   paiement enregistré : prolongation d'un mois + réactivation de l'hôtel
 */
class AbonnementService
{
    /** Jours avant l'échéance où un rappel est envoyé, du plus proche au plus lointain. */
    public const RAPPELS_JOURS = [1, 7];

    /**
     * Traitement quotidien. Retourne le nombre d'actions par type, pour le log de la commande.
     *
     * @return array{rappels:int, retards:int, suspensions:int}
     */
    public function traiterEcheances(): array
    {
        $stats = ['rappels' => 0, 'retards' => 0, 'suspensions' => 0];

        // Seul le dernier abonnement de chaque hôtel compte : un ancien abonnement
        // échu, remplacé depuis, ne doit pas déclencher de relance.
        // Une pause planifiée commence avant l'échéance : pas de relance d'ici là.
        $enPause = AbonnementPause::active()->pluck('abonnement_id')->flip();

        $abonnements = Hotel::with('dernierAbonnement.hotel')->get()
            ->pluck('dernierAbonnement')
            ->filter(fn(?Abonnement $a) => $a
                && $a->date_fin
                && !$enPause->has($a->id)
                && in_array($a->statut, [Abonnement::STATUT_ACTIF, Abonnement::STATUT_RETARD], true));

        foreach ($abonnements as $abonnement) {
            try {
                $cle = $this->traiter($abonnement);
                if (isset($stats[$cle])) {
                    $stats[$cle]++;
                }
            } catch (Throwable $e) {
                Log::error('Échéance abonnement : traitement impossible', [
                    'abonnement_id' => $abonnement->id,
                    'error'         => $e->getMessage(),
                ]);
            }
        }

        return $stats;
    }

    /** Traite un abonnement et retourne la clé de statistique concernée. */
    private function traiter(Abonnement $abonnement): string
    {
        $jours = $abonnement->joursAvantExpiration();

        if ($jours < -Abonnement::DELAI_GRACE_JOURS) {
            $this->suspendre($abonnement);
            return 'suspensions';
        }

        if ($jours < 0) {
            if ($abonnement->statut === Abonnement::STATUT_ACTIF) {
                $this->passerEnRetard($abonnement);
                return 'retards';
            }
            return 'aucune';
        }

        foreach (self::RAPPELS_JOURS as $seuil) {
            // « ≤ seuil » plutôt que « = seuil » : un rappel manqué (tâche arrêtée
            // un jour) part quand même le lendemain, une seule fois par échéance.
            $type = "j{$seuil}";
            if ($jours <= $seuil && !$abonnement->rappelDejaEnvoye($type)) {
                $this->envoyerRappel($abonnement, $type, $jours);
                // À J-1, le rappel de J-7 n'a plus lieu d'être : on le marque comme fait.
                foreach (self::RAPPELS_JOURS as $autre) {
                    if ($autre > $seuil) {
                        $abonnement->marquerRappelEnvoye("j{$autre}");
                    }
                }
                return 'rappels';
            }
        }

        return 'aucune';
    }

    private function envoyerRappel(Abonnement $abonnement, string $type, int $jours): void
    {
        $fin = $abonnement->date_fin->format('d/m/Y');
        $delai = $jours === 0 ? "aujourd'hui" : ($jours === 1 ? 'demain' : "dans {$jours} jours");

        $this->notifierHotel(
            $abonnement,
            'abonnement_rappel',
            'Votre abonnement expire ' . $delai,
            "Votre abonnement EVADIA expire le {$fin}. Pensez à régler le prochain mois pour rester visible sur le site.",
            'rappel',
        );

        $abonnement->marquerRappelEnvoye($type);
    }

    private function passerEnRetard(Abonnement $abonnement): void
    {
        $abonnement->update(['statut' => Abonnement::STATUT_RETARD]);
        $this->historiser($abonnement, Abonnement::STATUT_RETARD, null);

        $suspension = $abonnement->dateSuspensionPrevue()->format('d/m/Y');
        $hotel = $abonnement->hotel;

        $this->notifierHotel(
            $abonnement,
            'abonnement_retard',
            'Abonnement échu : paiement en attente',
            "Votre abonnement a expiré le {$abonnement->date_fin->format('d/m/Y')}. Sans paiement, votre hôtel sera retiré du site le {$suspension}.",
            'retard',
        );

        $this->notifierAdmins(
            $abonnement,
            'abonnement_retard',
            "Abonnement en retard : {$hotel->nom}",
            "Échéance du {$abonnement->date_fin->format('d/m/Y')} dépassée. Suspension automatique le {$suspension} sans paiement.",
        );
    }

    private function suspendre(Abonnement $abonnement): void
    {
        $hotel = $abonnement->hotel;

        DB::transaction(function () use ($abonnement, $hotel) {
            $abonnement->update(['statut' => Abonnement::STATUT_SUSPENDU]);
            $this->historiser($abonnement, Abonnement::STATUT_SUSPENDU, null);

            // On ne suspend qu'un hôtel actif : un hôtel en attente, fermé ou déjà
            // suspendu pour une autre raison garde son statut.
            if ($hotel->currentStatut?->statut === 'actif') {
                $this->changerStatutHotel($hotel, 'suspendu', Abonnement::RAISON_IMPAYE, null);
            }
        });

        FrontendCache::purgerHotels();

        $this->notifierHotel(
            $abonnement,
            'abonnement_suspendu',
            'Hôtel suspendu : abonnement impayé',
            "Votre hôtel n'est plus visible sur EVADIA et n'accepte plus de nouvelles réservations. Les réservations existantes restent valables. Contactez l'équipe EVADIA pour régulariser.",
            'suspension',
        );

        $this->notifierAdmins(
            $abonnement,
            'abonnement_suspendu',
            "Hôtel suspendu (impayé) : {$hotel->nom}",
            "Aucun paiement reçu {$this->joursDeRetard($abonnement)} jours après l'échéance du {$abonnement->date_fin->format('d/m/Y')}.",
        );
    }

    /**
     * Enregistre un paiement : prolonge l'abonnement d'un mois et réactive l'hôtel
     * s'il avait été suspendu pour impayé.
     */
    public function enregistrerPaiement(Abonnement $abonnement, ?int $userId): Abonnement
    {
        $abonnement->loadMissing('hotel.currentStatut');
        $aujourdhui = today();

        // En retard (délai de grâce) : on repart de l'échéance, le mois suivant reste
        // dû en entier. Suspendu ou déjà expiré depuis longtemps : on repart d'aujourd'hui.
        // En pause : l'échéance est prolongée, la pause continue ; les jours payés
        // non utilisés (y compris ce mois-ci) seront rendus à la reprise.
        $enPause = $abonnement->statut === Abonnement::STATUT_PAUSE;

        $continuite = $enPause || ($abonnement->statut !== Abonnement::STATUT_SUSPENDU
            && $abonnement->date_fin
            && $abonnement->dateSuspensionPrevue()->gt($aujourdhui));

        $base = $continuite ? $abonnement->date_fin->copy() : $aujourdhui->copy();
        // Premier jour réellement couvert par ce paiement.
        $periodeDebut = $continuite ? $abonnement->date_fin->copy()->addDay() : $aujourdhui->copy();

        $etaitSuspendu = false;

        DB::transaction(function () use ($abonnement, $base, $periodeDebut, $userId, $enPause, &$etaitSuspendu) {
            $abonnement->update([
                'date_fin'        => $base->addMonthNoOverflow(),
                'statut'          => $enPause ? Abonnement::STATUT_PAUSE : Abonnement::STATUT_ACTIF,
                'rappels_envoyes' => null,
            ]);
            $this->historiser($abonnement, 'paiement', $userId);

            AbonnementPaiement::create([
                'abonnement_id'  => $abonnement->id,
                'hotel_id'       => $abonnement->hotel_id,
                'periode_debut'  => $periodeDebut,
                'periode_fin'    => $abonnement->date_fin,
                'montant'        => $abonnement->prix_mensuel,
                'devise'         => $abonnement->devise,
                'source'         => AbonnementPaiement::SOURCE_PAIEMENT,
                'enregistre_par' => $userId,
            ]);

            $etaitSuspendu = !$enPause && $this->reactiverHotelSiImpaye($abonnement->hotel, $userId);
        });

        if ($etaitSuspendu) {
            FrontendCache::purgerHotels();
        }

        $this->notifierHotel(
            $abonnement,
            'abonnement_paiement',
            'Paiement reçu, merci !',
            "Votre abonnement est prolongé jusqu'au {$abonnement->date_fin->format('d/m/Y')}."
                . ($etaitSuspendu ? ' Votre hôtel est de nouveau visible sur EVADIA.' : ''),
            null,
        );

        return $abonnement;
    }

    /**
     * À appeler à la création d'un abonnement (création d'hôtel ou « Nouvel abonnement ») :
     * enregistre sa période de départ comme payée et, si l'hôtel était suspendu
     * pour impayé, le réactive. À appeler dans la transaction de création ;
     * retourne true si l'hôtel a été réactivé (caches du site à vider ensuite).
     */
    public function demarrer(Abonnement $abonnement, ?int $userId): bool
    {
        AbonnementPaiement::create([
            'abonnement_id'  => $abonnement->id,
            'hotel_id'       => $abonnement->hotel_id,
            'periode_debut'  => $abonnement->date_debut,
            'periode_fin'    => $abonnement->date_fin,
            'montant'        => $abonnement->prix_mensuel,
            'devise'         => $abonnement->devise,
            'source'         => AbonnementPaiement::SOURCE_INITIAL,
            'enregistre_par' => $userId,
        ]);

        $hotel = $abonnement->hotel ?? Hotel::find($abonnement->hotel_id);

        return $hotel && $abonnement->estActif() && $this->reactiverHotelSiImpaye($hotel, $userId);
    }

    /**
     * Recale le statut après une modification manuelle des dates par l'admin
     * (prolongation du délai, correction d'une échéance…).
     */
    public function recalerStatut(Abonnement $abonnement, ?int $userId): void
    {
        // Pendant une pause, c'est la reprise qui fixe le statut.
        if ($abonnement->statut === Abonnement::STATUT_PAUSE) {
            return;
        }

        $jours = $abonnement->joursAvantExpiration();

        $statut = match (true) {
            $jours === null || $jours >= 0            => Abonnement::STATUT_ACTIF,
            $jours >= -Abonnement::DELAI_GRACE_JOURS  => Abonnement::STATUT_RETARD,
            default                                   => $abonnement->statut,
        };

        if ($statut === $abonnement->statut) {
            return;
        }

        $abonnement->update(['statut' => $statut, 'rappels_envoyes' => null]);

        if ($abonnement->hotel && $this->reactiverHotelSiImpaye($abonnement->hotel, $userId)) {
            FrontendCache::purgerHotels();
        }
    }

    /** Réactive l'hôtel uniquement si sa suspension en cours vient d'un impayé. */
    private function reactiverHotelSiImpaye(Hotel $hotel, ?int $userId): bool
    {
        $statut = $hotel->currentStatut()->first();

        if ($statut?->statut !== 'suspendu' || $statut->raison !== Abonnement::RAISON_IMPAYE) {
            return false;
        }

        $this->changerStatutHotel($hotel, 'actif', 'Paiement reçu', $userId);
        return true;
    }

    public function changerStatutHotel(Hotel $hotel, string $statut, string $raison, ?int $userId): void
    {
        $now = now();
        $hotel->statuts()->whereNull('date_fin')->update(['date_fin' => $now]);

        HotelStatut::create([
            'hotel_id'   => $hotel->id,
            'statut'     => $statut,
            'date_debut' => $now,
            'raison'     => $raison,
            'changed_by' => $userId,
        ]);

        $hotel->unsetRelation('currentStatut');
    }

    public function historiser(Abonnement $abonnement, string $statut, ?int $userId): void
    {
        AbonnementHistorique::create([
            'abonnement_id'   => $abonnement->id,
            'type_abonnement' => $abonnement->type_abonnement,
            'date_debut'      => $abonnement->date_debut,
            'date_fin'        => $abonnement->date_fin,
            'prix_mensuel'    => $abonnement->prix_mensuel,
            'statut'          => $statut,
            'changed_by'      => $userId,
        ]);
    }

    private function joursDeRetard(Abonnement $abonnement): int
    {
        return abs((int) $abonnement->joursAvantExpiration());
    }

    /**
     * Notification dans le back office hôtel, et email si $mail est fourni :
     * une étape d'échéance (« rappel », « retard »…) ou un Mailable prêt à l'emploi.
     * Un échec d'envoi n'interrompt jamais le traitement des autres hôtels.
     */
    public function notifierHotel(Abonnement $abonnement, string $type, string $titre, string $contenu, Mailable|string|null $mail): void
    {
        $users = $this->utilisateursHotel($abonnement->hotel_id);
        $mailable = is_string($mail) ? new AbonnementEcheanceMail($abonnement, $mail) : $mail;

        foreach ($users as $user) {
            Notification::create([
                'user_id'           => $user->id,
                'type_notification' => $type,
                'titre'             => $titre,
                'contenu'           => $contenu,
                'lien'              => route('hotel.subscription.index', [], false),
                'canal'             => 'in_app',
                'date_envoi'        => now(),
            ]);

            if ($mailable && $user->email) {
                try {
                    Mail::to($user->email)->send($mailable);
                } catch (Throwable $e) {
                    Log::warning('Échéance abonnement : email non envoyé', [
                        'abonnement_id' => $abonnement->id,
                        'email'         => $user->email,
                        'error'         => $e->getMessage(),
                    ]);
                }
            }
        }
    }

    public function notifierAdmins(Abonnement $abonnement, string $type, string $titre, string $contenu): void
    {
        $admins = User::where('est_actif', true)
            ->whereHas('roles', fn($q) => $q->whereIn('code', ['super_admin', 'admin_evadia'])
                ->where('user_roles.est_actif', true))
            ->pluck('id');

        foreach ($admins as $adminId) {
            Notification::create([
                'user_id'           => $adminId,
                'type_notification' => $type,
                'titre'             => $titre,
                'contenu'           => $contenu,
                'lien'              => route('admin.subscriptions.show', $abonnement, false),
                'canal'             => 'in_app',
                'date_envoi'        => now(),
            ]);
        }
    }

    /** @return Collection<int, User> */
    private function utilisateursHotel(int $hotelId): Collection
    {
        $ids = HotelAdmin::where('hotel_id', $hotelId)
            ->whereNull('date_fin')
            ->pluck('user_id');

        return User::whereIn('id', $ids)->where('est_actif', true)->get(['id', 'email']);
    }
}
