<?php

namespace App\Services;

use App\Models\Offre;
use App\Models\OffreUtilisation;
use App\Models\Propriete;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Règles d'application d'une offre à une réservation, partagées par :
 *  - la réservation avec code promo (apps mobiles, API) ;
 *  - la réservation depuis la page d'une offre (site client, réduction automatique) ;
 *  - l'aperçu public du prix réduit.
 */
class OffreService
{
    /** Avantages qui modifient le prix ; les autres sont des avantages en nature. */
    private const TYPES_MONETAIRES = ['reduction_pct', 'reduction_montant', 'nuit_gratuite'];

    /** Offre active par son code promo, quelle que soit la casse saisie. */
    public function trouverParCode(string $code): ?Offre
    {
        return $this->actives()
            ->whereRaw('upper(code_promo) = ?', [mb_strtoupper(trim($code))])
            ->first();
    }

    /** Offre active (statut + période en cours) par son identifiant. */
    public function trouverActive(int $id): ?Offre
    {
        return $this->actives()->find($id);
    }

    /**
     * Chambres auxquelles l'offre s'applique.
     * Retourne null pour une offre globale Evadia (sans hôtel ni ciblage) : elle vaut partout.
     *
     * @return Collection<int, Propriete>|null
     */
    public function proprietesApplicables(Offre $offre): ?Collection
    {
        $offre->loadMissing('avantages.applications');
        $applications = $offre->avantages->flatMap->applications;

        $proprieteIds = $applications->where('entite_type', 'propriete')->pluck('entite_id');
        $hotelIds = $applications->where('entite_type', 'hotel')->pluck('entite_id');

        // Ciblage absent ou uniquement sur des services : toute l'offre de l'hôtel porteur.
        if ($proprieteIds->isEmpty() && $hotelIds->isEmpty()) {
            if (!$offre->hotel_id) {
                return null;
            }
            $hotelIds = collect([$offre->hotel_id]);
        }

        return Propriete::query()
            ->where(fn ($q) => $q->whereIn('id', $proprieteIds)->orWhereIn('hotel_id', $hotelIds))
            ->orderBy('nom')
            ->get(['id', 'nom', 'hotel_id']);
    }

    /**
     * Vérifie que l'offre s'applique à la chambre et calcule la réduction.
     * Sans $clientId (aperçu public), la règle « déjà utilisée » n'est pas contrôlée.
     *
     * @return array{valide: bool, message?: string, offre?: Offre, montant_reduction?: float, avantages_en_nature?: list<string>}
     */
    public function calculer(Offre $offre, Propriete $propriete, float $prixBase, int $nbNuits, ?int $clientId): array
    {
        $applicables = $this->proprietesApplicables($offre);

        if ($applicables !== null && !$applicables->contains('id', $propriete->id)) {
            return ['valide' => false, 'message' => 'Cette offre ne s\'applique pas à cette chambre.'];
        }

        if ($clientId !== null) {
            $dejaUtilise = OffreUtilisation::whereHas('avantage', fn ($q) => $q->where('offre_id', $offre->id))
                ->where('client_id', $clientId)
                ->exists();

            if ($dejaUtilise) {
                return ['valide' => false, 'message' => 'Vous avez déjà utilisé cette offre.'];
            }
        }

        $offre->loadMissing(['avantages.type', 'avantages.utilisations']);

        // Cumul des avantages monétaires
        $montantReduction = 0;
        $avantagesEnNature = [];

        foreach ($offre->avantages as $avantage) {
            // Avantage épuisé : on passe au suivant
            if ($avantage->quantite_max !== null && $avantage->utilisations->count() >= $avantage->quantite_max) {
                continue;
            }

            switch ($avantage->type?->code) {
                case 'reduction_pct':
                    // valeur = pourcentage (ex: 20 pour -20%)
                    $montantReduction += $prixBase * ((float) $avantage->valeur / 100);
                    break;

                case 'reduction_montant':
                    // valeur = montant fixe à déduire
                    $montantReduction += (float) $avantage->valeur;
                    break;

                case 'nuit_gratuite':
                    // valeur = nombre de nuits gratuites offertes
                    $nuitsGratuites = min((int) $avantage->valeur, $nbNuits);
                    $prixNuit = $nbNuits > 0 ? $prixBase / $nbNuits : 0;
                    $montantReduction += $prixNuit * $nuitsGratuites;
                    break;

                // Petit-déjeuner, spa… : ne modifient pas le prix, l'hôtel doit les fournir.
                default:
                    if ($avantage->type && !in_array($avantage->type->code, self::TYPES_MONETAIRES, true)) {
                        $avantagesEnNature[] = trim($avantage->type->nom . ($avantage->valeur ? ' : ' . $avantage->valeur : ''));
                    }
                    break;
            }
        }

        // La réduction ne peut pas dépasser le prix de base
        return [
            'valide'              => true,
            'offre'               => $offre,
            'montant_reduction'   => min(round($montantReduction, 2), $prixBase),
            'avantages_en_nature' => $avantagesEnNature,
        ];
    }

    /** Avantages en nature d'une offre (pour l'affichage côté hôtel). */
    public function avantagesEnNature(Offre $offre): array
    {
        $offre->loadMissing('avantages.type');

        return $offre->avantages
            ->filter(fn ($a) => $a->type && !in_array($a->type->code, self::TYPES_MONETAIRES, true))
            ->map(fn ($a) => trim($a->type->nom . ($a->valeur ? ' : ' . $a->valeur : '')))
            ->values()
            ->all();
    }

    private function actives(): Builder
    {
        return Offre::with(['avantages.type', 'avantages.applications', 'avantages.utilisations'])
            ->where('statut', 'active')
            // Dates sans heure : comparer au jour, sinon l'offre disparaît le jour de sa fin
            ->whereDate('date_debut', '<=', today())
            ->whereDate('date_fin', '>=', today());
    }
}
