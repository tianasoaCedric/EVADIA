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
            ['nom' => 'Nord',                   'description' => 'Nosy Be, Diego Suarez, Ambanja',    'image_url' => '/photos/destinations/nord.jpg'],
            ['nom' => 'Sud',                     'description' => 'Tuléar, Fort Dauphin, Isalo',       'image_url' => '/photos/destinations/sud.jpg'],
            ['nom' => 'Est',                     'description' => 'Tamatave, Île Sainte-Marie',         'image_url' => '/photos/destinations/est.jpg'],
            ['nom' => 'Ouest',                   'description' => 'Morondava, Majunga, Allée des Baobabs', 'image_url' => '/photos/destinations/ouest.jpg'],
            ['nom' => 'Hautes terres centrales', 'description' => 'Antananarivo, Antsirabe, Fianarantsoa', 'image_url' => '/photos/destinations/hautes-terres.jpg'],
        ];

        foreach ($destinations as $dest) {
            \App\Models\Destination::firstOrCreate(
                ['nom' => $dest['nom']],
                ['description' => $dest['description'], 'image_url' => $dest['image_url']]
            );
            // Mettre à jour image_url si la ligne existait déjà sans image
            \App\Models\Destination::where('nom', $dest['nom'])
                ->whereNull('image_url')
                ->update(['image_url' => $dest['image_url']]);
        }
    }
}
