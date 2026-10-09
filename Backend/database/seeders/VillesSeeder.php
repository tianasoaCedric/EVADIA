<?php

namespace Database\Seeders;

use App\Support\FrontendCache;
use App\Support\Media;
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

        // Images des villes — clés S3 déjà uploadées, indexées par destination puis ville
        $images = [
            'Nord' => [
                'Nosy Be' => ['image' => 'villes/eJ3U8wT1ZFPgPNerNBddATIgLOwLONK1q9unJJy0.webp'],
            ],
            'Ouest' => [
                'Mahajanga' => ['image' => 'villes/FLk7ZerGmz1SjFZzBZtIL2zZV51xpEbTDbmngn6z.webp'],
                'Morondava' => ['image' => 'villes/s1DYoi5Tc3Be1YzGMP8Z5bx4Bqo6PVA36eInmwo7.webp'],
            ],
            'Est' => [
                'Sainte-Marie' => ['image' => 'villes/S3D0GtI8Ep3OB6mLDn6POJlB7sSUCvjW2YEcjaR1.webp'],
            ],
            'Hautes terres centrales' => [
                'Antananarivo' => [
                    'image'      => 'villes/LvZ253cNhV9wPIubbBbA4o0GQ9MSmXvEZ7h7GX99.webp',
                    'couverture' => ['villes/couverture/quRCOiAsGsrj6H26Iku9jjpFGO3xVfCMiS5CA6Nf.webp'],
                ],
                'Ampefy'    => ['image' => 'villes/osf2eYhoLm5hR2HzRzdh0wJcVbYEte9cigMzcDXX.webp'],
                'Andasibe'  => ['image' => 'villes/zBjbjcuMbb3SQRh7RLYJa8d8GMKrMJqkKfWYFpoA.webp'],
                'Antsirabe' => ['image' => 'villes/IeSta49qMFauInRt9bpO3Z1N4gk3hTzYVg4RLKNx.webp'],
                'Mantasoa'  => ['image' => 'villes/m51N6x3zYDWSvFYcqml4bYwKMrKkrKinWuDzg6y7.webp'],
                'Isalo'     => ['image' => 'villes/ZK9f98zcoCicVJckMS2jld6D601HAzFGqzRNilWh.webp'],
            ],
            'Sud' => [
                'Toliara' => ['image' => 'villes/U7kzHpW8imhu0o36wPzYqE2JdAXdbKXvhySXDJut.webp'],
            ],
        ];

        foreach ($villes as $destinationNom => $nomVilles) {
            $destination = Destination::where('nom', $destinationNom)->first();

            if (!$destination) {
                $this->command->warn("Destination '$destinationNom' introuvable, ignorée.");
                continue;
            }

            foreach ($nomVilles as $nom) {
                $ville = Ville::firstOrCreate(
                    ['nom' => $nom, 'destination_id' => $destination->id],
                );

                // Ne remplit que les champs vides ou pointant vers un fichier supprimé du bucket :
                // on n'écrase pas une image valide changée depuis l'admin
                $media = $images[$destinationNom][$nom] ?? null;
                if (!$media) {
                    continue;
                }
                if (Media::missing($ville->image)) {
                    $ville->image = $media['image'];
                }
                if (!empty($media['couverture']) && Media::missing($ville->couverture)) {
                    $ville->couverture = $media['couverture'];
                }
                $ville->save();
            }
        }

        FrontendCache::purgerDestinationsEtVilles();
    }
}
