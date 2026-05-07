<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TypesAvantage;

class TypesAvantagesSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'reduction_pct',    'nom' => 'Réduction en pourcentage', 'description' => 'Ex : -20%'],
            ['code' => 'reduction_montant','nom' => 'Réduction en montant',      'description' => 'Ex : -50 000 Ar'],
            ['code' => 'petit_dejeuner',   'nom' => 'Petit-déjeuner offert',     'description' => 'Petit-déjeuner inclus'],
            ['code' => 'nuit_gratuite',    'nom' => 'Nuit gratuite',             'description' => 'Ex : 2 nuits payées = 1 offerte'],
            ['code' => 'transfert_offert', 'nom' => 'Transfert offert',          'description' => 'Navette ou transfert inclus'],
            ['code' => 'surclassement',    'nom' => 'Surclassement',             'description' => 'Upgrade de chambre offert'],
            ['code' => 'spa_offert',       'nom' => 'Accès spa offert',          'description' => 'Accès spa ou soin inclus'],
            ['code' => 'repas_offert',     'nom' => 'Repas offert',              'description' => 'Dîner ou déjeuner inclus'],
            ['code' => 'early_checkin',    'nom' => 'Early check-in',            'description' => 'Arrivée anticipée offerte'],
            ['code' => 'late_checkout',    'nom' => 'Late check-out',            'description' => 'Départ tardif offert'],
        ];

        foreach ($types as $type) {
            TypesAvantage::firstOrCreate(
                ['code' => $type['code']],
                ['nom' => $type['nom'], 'description' => $type['description']]
            );
        }
    }
}
