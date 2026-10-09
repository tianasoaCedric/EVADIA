<?php

namespace App\Services;

use App\Models\AbonnementPause;
use App\Models\Disponibilite;
use App\Models\Propriete;
use App\Models\Reservation;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;

/**
 * Occupation d'une propriété nuit par nuit.
 *
 * Une propriété représente un stock de `nombre_unites` unités identiques
 * (ex. 10 chambres « Standard »). Une réservation occupe une unité pour
 * chaque nuit de [date_debut, date_fin[ — le jour du départ reste libre.
 * Une nuit est complète quand toutes les unités sont occupées.
 */
class DisponibiliteService
{
    /** Statuts qui bloquent une unité (une demande en attente la réserve déjà). */
    public const STATUTS_OCCUPANTS = ['en_attente', 'acceptee'];

    /** Réservations actives qui occupent au moins une nuit de [debut, finExclusive[. */
    public function reservationsActives(Propriete $propriete, Carbon $debut, Carbon $finExclusive): Collection
    {
        return Reservation::where('propriete_id', $propriete->id)
            ->whereIn('statut', self::STATUTS_OCCUPANTS)
            ->where('date_debut', '<', $finExclusive->toDateString())
            ->where('date_fin', '>', $debut->toDateString())
            ->get();
    }

    /**
     * Réservations actives groupées par nuit occupée.
     *
     * @return array<string, Collection> 'Y-m-d' => réservations occupant cette nuit
     */
    public function reservationsParNuit(Collection $reservations, Carbon $debut, Carbon $finExclusive): array
    {
        $parNuit = [];
        foreach (CarbonPeriod::create($debut, $finExclusive->copy()->subDay()) as $nuit) {
            $parNuit[$nuit->toDateString()] = $reservations->filter(
                fn(Reservation $r) => $r->date_debut->lte($nuit) && $r->date_fin->gt($nuit)
            )->values();
        }

        return $parNuit;
    }

    /**
     * Nuits de [debut, fin[ où la propriété ne peut plus être réservée :
     * fermée par l'hôtel ou toutes les unités déjà occupées.
     *
     * @return string[] dates 'Y-m-d'
     */
    public function nuitsIndisponibles(Propriete $propriete, Carbon $debut, Carbon $fin): array
    {
        $fermees = Disponibilite::where('propriete_id', $propriete->id)
            ->where('est_disponible', false)
            ->where('date', '>=', $debut->toDateString())
            ->where('date', '<', $fin->toDateString())
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->all();

        $parNuit = $this->reservationsParNuit($this->reservationsActives($propriete, $debut, $fin), $debut, $fin);
        $completes = array_keys(array_filter(
            $parNuit,
            fn(Collection $rs) => $rs->count() >= max(1, (int) $propriete->nombre_unites)
        ));

        $indisponibles = array_values(array_unique(array_merge($fermees, $completes)));
        sort($indisponibles);

        return $indisponibles;
    }

    public const HOTEL_DISPONIBLE = 'disponible';
    public const HOTEL_COMPLET = 'complet';
    public const HOTEL_EN_PAUSE = 'en_pause';

    /**
     * Disponibilité de plusieurs hôtels pour la nuit de ce soir (listes, cartes hôtel).
     * Mêmes règles que la réservation : un hôtel est disponible si au moins une de ses
     * chambres n'est ni fermée ce soir ni occupée sur toutes ses unités ; « en pause » s'il
     * est en pause d'abonnement cette nuit. Requêtes groupées : leur nombre ne dépend pas
     * du nombre d'hôtels.
     *
     * @param  int[]  $hotelIds
     * @return array<int, string> hotel_id => HOTEL_* (hôtels sans chambre absents)
     */
    public function statutsHotelsCeSoir(array $hotelIds): array
    {
        if ($hotelIds === []) {
            return [];
        }

        $ceSoir = today();
        $demain = $ceSoir->copy()->addDay();

        $enPause = AbonnementPause::active()
            ->whereIn('hotel_id', $hotelIds)
            ->where('date_debut', '<', $demain->toDateString())
            ->where('date_reprise', '>', $ceSoir->toDateString())
            ->pluck('hotel_id')
            ->flip();

        $proprietes = Propriete::whereIn('hotel_id', $hotelIds)->get(['id', 'hotel_id', 'nombre_unites']);
        $proprieteIds = $proprietes->pluck('id');

        $fermees = Disponibilite::whereIn('propriete_id', $proprieteIds)
            ->where('est_disponible', false)
            ->whereDate('date', $ceSoir)
            ->pluck('propriete_id')
            ->flip();

        $occupees = Reservation::whereIn('propriete_id', $proprieteIds)
            ->whereIn('statut', self::STATUTS_OCCUPANTS)
            ->where('date_debut', '<=', $ceSoir->toDateString())
            ->where('date_fin', '>', $ceSoir->toDateString())
            ->groupBy('propriete_id')
            ->selectRaw('propriete_id, COUNT(*) AS nb')
            ->pluck('nb', 'propriete_id');

        $statuts = [];
        foreach ($proprietes->groupBy('hotel_id') as $hotelId => $chambres) {
            if ($enPause->has($hotelId)) {
                $statuts[$hotelId] = self::HOTEL_EN_PAUSE;
                continue;
            }

            $uneLibre = $chambres->contains(fn(Propriete $p) =>
                ! $fermees->has($p->id)
                && (int) ($occupees[$p->id] ?? 0) < max(1, (int) $p->nombre_unites)
            );

            $statuts[$hotelId] = $uneLibre ? self::HOTEL_DISPONIBLE : self::HOTEL_COMPLET;
        }

        return $statuts;
    }
}
