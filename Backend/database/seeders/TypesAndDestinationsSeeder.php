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
            ['nom' => 'Paris', 'description' => 'Capitale française'],
            ['nom' => 'Côte d\'Azur', 'description' => 'Riviera française'],
            ['nom' => 'Alpes françaises', 'description' => 'Stations de montagne'],
            ['nom' => 'Bretagne', 'description' => 'Côte atlantique bretonne'],
            ['nom' => 'Provence', 'description' => 'Sud de la France'],
            ['nom' => 'Bordeaux', 'description' => 'Région viticole'],
            ['nom' => 'Lyon', 'description' => 'Capitale gastronomique'],
            ['nom' => 'Barcelone', 'description' => 'Capitale catalane'],
            ['nom' => 'Madrid', 'description' => 'Capitale espagnole'],
            ['nom' => 'Rome', 'description' => 'Ville éternelle'],
            ['nom' => 'Milan', 'description' => 'Capitale de la mode'],
            ['nom' => 'Marrakech', 'description' => 'Ville impériale'],
            ['nom' => 'Agadir', 'description' => 'Station balnéaire atlantique'],
            ['nom' => 'Dakar', 'description' => 'Capitale sénégalaise'],
            ['nom' => 'Abidjan', 'description' => 'Capitale économique ivoirienne'],
            ['nom' => 'Dubaï', 'description' => 'Métropole du luxe'],
            ['nom' => 'New York', 'description' => 'La ville qui ne dort jamais'],
            ['nom' => 'Bali', 'description' => 'Île des dieux'],
            ['nom' => 'Maldives', 'description' => 'Archipel paradisiaque'],
            ['nom' => 'La Réunion', 'description' => 'Île de la Réunion'],
        ];

        foreach ($destinations as $dest) {
            \App\Models\Destination::firstOrCreate(['nom' => $dest['nom']], ['description' => $dest['description']]);
        }
    }
}
