<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Destination;
use App\Models\Ville;

class VillesSeeder extends Seeder
{
    public function run(): void
    {
        $villes = [
            'Nord' => [
                'Antsiranana', 'Nosy Be', 'Ambanja', 'Nosy Komba', 'SAVA',
                'Nosy Saba', 'Nosy Tsarabanjina', 'Nosy Ankao', 'Anjahakely', 'Nosy Mitsio',
            ],
            'Ouest' => [
                'Mahajanga', 'Morondava', 'Miandrivazo', 'Tsiribihina',
                'Bemaraha', 'Anjajavy',
            ],
            'Est' => [
                'Maroantsetra', 'Masoala', 'Sainte-Marie', 'Foulpointe',
                'Mahambo', 'Toamasina', 'Manambato',
            ],
            'Hautes terres centrales' => [
                'Antananarivo', 'Ampefy', 'Andasibe', 'Antsirabe', 'Mantasoa',
                'Tsiazompaniry', 'Anjozorobe', 'Fianarantsoa', 'Ambalavao',
                'Isalo', 'Andringitra', 'Ranomafana',
            ],
            'Sud' => [
                'Isalo', 'Toliara', 'Fort-Dauphin', 'Anakao',
                'Ambatomilo', 'Salary', 'Andavadaoka',
            ],
        ];

        foreach ($villes as $destinationNom => $nomVilles) {
            $destination = Destination::where('nom', $destinationNom)->first();

            if (!$destination) {
                $this->command->warn("Destination '$destinationNom' introuvable, ignorée.");
                continue;
            }

            foreach ($nomVilles as $nom) {
                Ville::firstOrCreate(
                    ['nom' => $nom, 'destination_id' => $destination->id],
                );
            }
        }
    }
}
