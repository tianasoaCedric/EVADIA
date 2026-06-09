<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hotel;
use App\Models\Offre;

class OffreSeeder extends Seeder
{
    public function run(): void
    {
        $hotels = Hotel::with('adresse')->get();

        if ($hotels->isEmpty()) {
            $this->command->warn('Aucun hôtel trouvé — lancez d\'abord les seeders hôtels.');
            return;
        }

        $offres = [
            [
                'titre'       => 'Offre Découverte',
                'description' => 'Profitez de notre offre découverte et bénéficiez d\'une réduction exceptionnelle sur votre séjour. Petit-déjeuner inclus.',
                'remise_pct'  => 20,
                'date_debut'  => now()->startOfMonth(),
                'date_fin'    => now()->addMonths(2)->endOfMonth(),
                'code_promo'  => 'DECOUVERTE20',
                'conditions'  => [
                    'Réservation minimum de 2 nuits',
                    'Offre non cumulable avec d\'autres promotions',
                    'Annulation gratuite jusqu\'à 48h avant l\'arrivée',
                    'Petit-déjeuner inclus pour 2 personnes',
                    'Tarif valable pour une chambre double standard',
                ],
            ],
            [
                'titre'       => 'Séjour Romantique',
                'description' => 'Offre spéciale couple : chambre supérieure avec vue, dîner aux chandelles et accès au spa inclus.',
                'remise_pct'  => 30,
                'date_debut'  => now()->startOfMonth(),
                'date_fin'    => now()->addMonths(3)->endOfMonth(),
                'code_promo'  => 'ROMANTIQUE30',
                'conditions'  => [
                    'Réservation minimum de 3 nuits',
                    'Valable les week-ends uniquement (vendredi au dimanche)',
                    'Dîner aux chandelles le soir de l\'arrivée',
                    'Accès spa inclus (1h par personne)',
                    'Non remboursable après confirmation',
                    'Sur présentation de la confirmation de réservation',
                ],
            ],
            [
                'titre'       => 'Pack Famille Madagascar',
                'description' => 'En famille, explorez Madagascar avec nos tarifs préférentiels. Chambre familiale, activités et excursions incluses.',
                'remise_pct'  => 25,
                'date_debut'  => now()->startOfMonth(),
                'date_fin'    => now()->addMonths(4)->endOfMonth(),
                'code_promo'  => 'FAMILLE25',
                'conditions'  => [
                    'Offre valable pour les familles de 2 adultes et 2 enfants maximum',
                    'Enfants de moins de 12 ans gratuits',
                    'Réservation minimum de 4 nuits',
                    'Petit-déjeuner inclus pour toute la famille',
                    'Une excursion d\'une journée incluse',
                    'Annulation gratuite jusqu\'à 7 jours avant l\'arrivée',
                ],
            ],
        ];

        foreach ($hotels as $index => $hotel) {
            $data = $offres[$index % count($offres)];

            // Évite les doublons si le seeder est relancé
            $exists = Offre::where('hotel_id', $hotel->id)
                ->where('code_promo', $data['code_promo'])
                ->exists();

            if ($exists) {
                continue;
            }

            Offre::create([
                ...$data,
                'hotel_id'   => $hotel->id,
                'statut'     => 'active',
                'created_by' => null,
            ]);

            $this->command->info("Offre \"{$data['titre']}\" créée pour {$hotel->nom}");
        }
    }
}
