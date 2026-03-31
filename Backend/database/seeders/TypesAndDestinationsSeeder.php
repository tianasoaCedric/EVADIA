<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TypesAndDestinationsSeeder extends Seeder
{
    public function run(): void
    {
        // Types d'hôtel
        $types = [
            ['nom' => 'Écolodge', 'description' => 'Hébergement écologique en pleine nature'],
            ['nom' => 'Hôtel de luxe', 'description' => 'Hôtel haut de gamme et prestige'],
            ['nom' => 'Villas', 'description' => 'Villa privée avec services'],
            ['nom' => 'Maison de Vacances', 'description' => 'Location de maison pour les vacances'],
            ['nom' => 'Lodge', 'description' => 'Lodge en nature ou safari'],
            ['nom' => 'Bungalow', 'description' => 'Bungalow tropical ou balnéaire'],
        ];

        foreach ($types as $type) {
            \App\Models\TypesHotel::firstOrCreate(['nom' => $type['nom']], ['description' => $type['description']]);
        }

        // Destinations
        $destinations = [
            ['nom' => 'Nord', 'description' => ''],
            ['nom' => 'Sud', 'description' => ''],
            ['nom' => 'Est', 'description' => ''],
            ['nom' => 'Ouest', 'description' => ''],
            ['nom' => 'Hautes terres centrales', 'description' => ''],
        ];

        foreach ($destinations as $dest) {
            \App\Models\Destination::firstOrCreate(['nom' => $dest['nom']], ['description' => $dest['description']]);
        }
    }
}
