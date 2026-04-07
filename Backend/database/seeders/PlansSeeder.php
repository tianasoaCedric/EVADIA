<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'code'        => 'explore',
                'nom'         => 'Explore',
                'label'       => 'EXPLORE',
                'description' => 'Visibilité essentielle sur la plateforme',
                'prix'        => 150000,
                'devise'      => 'MGA',
                'features'    => [
                    ['inclus' => true,  'texte' => 'Intégration sur le site web EVADIA'],
                    ['inclus' => true,  'texte' => 'Intégration sur l\'application mobile EVADIA'],
                    ['inclus' => false, 'texte' => 'Espace publicitaire pour les offres spéciales'],
                    ['inclus' => false, 'texte' => 'Sélection d\'hébergements mise en avant'],
                ],
                'badge_bg'    => 'bg-gray-100',
                'badge_text'  => 'text-gray-700',
                'border'      => 'border-gray-400',
                'ordre'       => 1,
            ],
            [
                'code'        => 'select',
                'nom'         => 'Select',
                'label'       => 'SELECT',
                'description' => 'Visibilité et mise en avant des offres',
                'prix'        => 350000,
                'devise'      => 'MGA',
                'features'    => [
                    ['inclus' => true,  'texte' => 'Intégration sur le site web EVADIA'],
                    ['inclus' => true,  'texte' => 'Intégration sur l\'application mobile EVADIA'],
                    ['inclus' => true,  'texte' => 'Espace publicitaire pour les offres spéciales'],
                    ['inclus' => false, 'texte' => 'Sélection d\'hébergements mise en avant'],
                ],
                'badge_bg'    => 'bg-evadia-100',
                'badge_text'  => 'text-evadia-700',
                'border'      => 'border-evadia-500',
                'ordre'       => 2,
            ],
            [
                'code'        => 'signature',
                'nom'         => 'Signature',
                'label'       => 'SIGNATURE',
                'description' => 'Visibilité maximale et prestige',
                'prix'        => 600000,
                'devise'      => 'MGA',
                'features'    => [
                    ['inclus' => true, 'texte' => 'Intégration sur le site web EVADIA'],
                    ['inclus' => true, 'texte' => 'Intégration sur l\'application mobile EVADIA'],
                    ['inclus' => true, 'texte' => 'Espace publicitaire offres spéciales (web & app)'],
                    ['inclus' => true, 'texte' => 'Sélection d\'hébergements mise en avant (web & app)'],
                ],
                'badge_bg'    => 'bg-amber-100',
                'badge_text'  => 'text-amber-700',
                'border'      => 'border-amber-500',
                'ordre'       => 3,
            ],
        ];

        foreach ($plans as $plan) {
            \App\Models\Plan::firstOrCreate(['code' => $plan['code']], $plan);
        }
    }
}
