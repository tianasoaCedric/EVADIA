<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\AbonnementPause;
use App\Models\Propriete;
use App\Services\DisponibiliteService;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;

class ProprieteController extends Controller
{
    /**
     * GET /proprietes/{id}
     * Détail public d'une chambre/propriété avec photos, équipements et hôtel parent.
     */
    public function show(int $id): JsonResponse
    {
        $propriete = Propriete::with([
            'photos'       => fn($q) => $q->orderBy('ordre'),
            'currentPrix',
            'currentStatut',
            'equipements',
            'hotel'        => fn($q) => $q->with('adresse'),
        ])
            ->whereHas('currentStatut', fn($q) => $q->where('statut', 'disponible'))
            ->find($id);

        if (!$propriete) {
            return response()->json(['message' => 'Chambre non trouvée'], 404);
        }

        return response()->json([
            'id'             => $propriete->id,
            'nom'            => $propriete->nom,
            'description'    => $propriete->description,
            'type_propriete' => $propriete->type_propriete,
            'capacite'       => $propriete->capacite,
            'nb_chambres'    => $propriete->nb_chambres,
            'nb_lits'        => $propriete->nb_lits,
            'nb_salles_bain' => $propriete->nb_salles_bain,
            'superficie'     => $propriete->superficie,
            'prix_par_nuit'  => $propriete->currentPrix?->prix,
            'devise'         => $propriete->currentPrix?->devise,
            'prix_mga'       => $propriete->currentPrix?->prix_mga,
            'prix_eur'       => $propriete->currentPrix?->prix_eur,
            'photos'         => $propriete->photos->map(fn($p) => [
                'url_photo'      => $p->url,
                'est_principale' => $p->est_principale,
                'ordre'          => $p->ordre,
            ]),
            'equipements'    => $propriete->equipements->map(fn($e) => [
                'id'       => $e->id,
                'nom'      => $e->nom,
                'categorie' => $e->categorie,
                'icone'    => $e->icone,
            ]),
            'hotel'          => [
                'id'      => $propriete->hotel->id,
                'nom'     => $propriete->hotel->nom,
                'etoiles' => $propriete->hotel->etoiles,
                'adresse' => $propriete->hotel->adresse ? [
                    'ville' => $propriete->hotel->adresse->ville,
                    'pays'  => $propriete->hotel->adresse->pays,
                ] : null,
                'exige_acompte'       => $propriete->hotel->exige_acompte,
                'pourcentage_acompte' => $propriete->hotel->pourcentage_acompte,
            ],
        ]);
    }

    /**
     * GET /proprietes/{id}/disponibilites
     * Nuits où la chambre ne peut plus être réservée (affichées en rouge dans le
     * calendrier client) : complètes, fermées par l'hôtel, ou hôtel en pause.
     * Mêmes règles que la création de réservation ; le jour du départ reste libre.
     */
    public function disponibilites(int $id, DisponibiliteService $dispo): JsonResponse
    {
        $propriete = Propriete::findOrFail($id);

        // Une réservation commence au plus tôt demain (date_debut after:today)
        $debut = today()->addDay();
        $fin   = today()->addYear();

        $nuits = $dispo->nuitsIndisponibles($propriete, $debut, $fin);

        // Pauses d'abonnement de l'hôtel : fermé de date_debut à la veille de date_reprise
        $pauses = AbonnementPause::active()
            ->where('hotel_id', $propriete->hotel_id)
            ->where('date_debut', '<', $fin->toDateString())
            ->where('date_reprise', '>', $debut->toDateString())
            ->get();

        foreach ($pauses as $pause) {
            $periode = CarbonPeriod::create($pause->date_debut->max($debut), $pause->date_reprise->copy()->subDay()->min($fin));
            foreach ($periode as $nuit) {
                $nuits[] = $nuit->toDateString();
            }
        }

        $nuits = array_values(array_unique($nuits));
        sort($nuits);

        return response()->json(['dates_reservees' => $nuits]);
    }
}
