<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Propriete;
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
}
