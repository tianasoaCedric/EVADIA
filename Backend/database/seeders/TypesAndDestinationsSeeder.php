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

        // Destinations — image_url / couverture sont des clés S3 déjà uploadées
        $destinations = [
            ['nom' => 'Nord',                    'description' => 'Nosy Be, Diego Suarez, Ambanja',         'image_url' => 'destinations/yKGCERrxqF8gi5AI2YqGO19Ct10CIrh95mosVP92.webp', 'couverture' => null],
            ['nom' => 'Sud',                     'description' => 'Tuléar, Fort Dauphin, Isalo',            'image_url' => 'destinations/vAmWACveL0mP0Hzhd1WNJxp436xOQHqyzNx6cK6D.webp', 'couverture' => null],
            ['nom' => 'Est',                     'description' => 'Tamatave, Île Sainte-Marie',             'image_url' => 'destinations/WAVOWFGvMkgJfJZWdGfy2t2JiMHiyXSX2Z0nbfwt.webp', 'couverture' => null],
            ['nom' => 'Ouest',                   'description' => 'Morondava, Majunga, Allée des Baobabs',  'image_url' => 'destinations/bpMA2yaxBU7JoIO03lO0R3x1fF4lknaUxDXWhT5S.webp', 'couverture' => null],
            ['nom' => 'Hautes terres centrales', 'description' => 'Antananarivo, Antsirabe, Fianarantsoa', 'image_url' => 'destinations/47CsXwJCjPrFdJ9BAxTdHikjuiqgGMH7xJgW3usV.webp', 'couverture' => ['destinations/couverture/rU9sk1ckezPzUjqXQLHjSvLSsb2lcTMKgJubn3jC.webp']],
        ];

        foreach ($destinations as $dest) {
            $destination = \App\Models\Destination::firstOrCreate(
                ['nom' => $dest['nom']],
                ['description' => $dest['description']]
            );

            // Ne remplit que les champs vides : on n'écrase pas une image changée depuis l'admin
            if (empty($destination->image_url)) {
                $destination->image_url = $dest['image_url'];
            }
            if (empty($destination->couverture) && $dest['couverture']) {
                $destination->couverture = $dest['couverture'];
            }
            $destination->save();
        }
    }
}
