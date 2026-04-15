<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EquipementSeeder extends Seeder
{
    public function run(): void
    {
        $equipements = [
            // Confort
            ['nom' => 'Climatisation', 'categorie' => 'Confort', 'icone' => 'snowflake'],
            ['nom' => 'Chauffage', 'categorie' => 'Confort', 'icone' => 'thermometer'],
            ['nom' => 'Ventilateur de plafond', 'categorie' => 'Confort', 'icone' => 'wind'],
            ['nom' => 'Literie de qualité supérieure', 'categorie' => 'Confort', 'icone' => 'bed'],
            ['nom' => 'Oreillers supplémentaires', 'categorie' => 'Confort', 'icone' => 'pillow'],
            ['nom' => 'Peignoirs', 'categorie' => 'Confort', 'icone' => 'shirt'],
            ['nom' => 'Chaussons', 'categorie' => 'Confort', 'icone' => 'footprints'],

            // Technologie
            ['nom' => 'Wi-Fi gratuit', 'categorie' => 'Technologie', 'icone' => 'wifi'],
            ['nom' => 'Télévision écran plat', 'categorie' => 'Technologie', 'icone' => 'tv'],
            ['nom' => 'Télévision satellite / câble', 'categorie' => 'Technologie', 'icone' => 'tv'],
            ['nom' => 'Téléphone', 'categorie' => 'Technologie', 'icone' => 'phone'],
            ['nom' => 'Réveil', 'categorie' => 'Technologie', 'icone' => 'alarm-clock'],
            ['nom' => 'Prises USB', 'categorie' => 'Technologie', 'icone' => 'usb'],

            // Salle de bain
            ['nom' => 'Salle de bain privée', 'categorie' => 'Salle de bain', 'icone' => 'bath'],
            ['nom' => 'Douche', 'categorie' => 'Salle de bain', 'icone' => 'shower-head'],
            ['nom' => 'Baignoire', 'categorie' => 'Salle de bain', 'icone' => 'bath'],
            ['nom' => 'Sèche-cheveux', 'categorie' => 'Salle de bain', 'icone' => 'wind'],
            ['nom' => 'Articles de toilette', 'categorie' => 'Salle de bain', 'icone' => 'droplets'],
            ['nom' => 'Serviettes de bain', 'categorie' => 'Salle de bain', 'icone' => 'towel'],

            // Cuisine / Minibar
            ['nom' => 'Minibar', 'categorie' => 'Cuisine', 'icone' => 'refrigerator'],
            ['nom' => 'Réfrigérateur', 'categorie' => 'Cuisine', 'icone' => 'refrigerator'],
            ['nom' => 'Machine à café / thé', 'categorie' => 'Cuisine', 'icone' => 'coffee'],
            ['nom' => 'Bouilloire électrique', 'categorie' => 'Cuisine', 'icone' => 'flame'],
            ['nom' => 'Four micro-ondes', 'categorie' => 'Cuisine', 'icone' => 'microwave'],
            ['nom' => 'Kitchenette', 'categorie' => 'Cuisine', 'icone' => 'utensils'],
            ['nom' => 'Cuisine équipée', 'categorie' => 'Cuisine', 'icone' => 'chef-hat'],

            // Sécurité
            ['nom' => 'Coffre-fort', 'categorie' => 'Sécurité', 'icone' => 'lock'],
            ['nom' => 'Serrure électronique', 'categorie' => 'Sécurité', 'icone' => 'key'],
            ['nom' => 'Alarme incendie', 'categorie' => 'Sécurité', 'icone' => 'bell'],
            ['nom' => 'Détecteur de fumée', 'categorie' => 'Sécurité', 'icone' => 'smoke'],

            // Espace de travail
            ['nom' => 'Bureau de travail', 'categorie' => 'Espace de travail', 'icone' => 'briefcase'],
            ['nom' => 'Chaise de bureau', 'categorie' => 'Espace de travail', 'icone' => 'armchair'],

            // Vue & Extérieur
            ['nom' => 'Balcon', 'categorie' => 'Vue & Extérieur', 'icone' => 'columns'],
            ['nom' => 'Terrasse privée', 'categorie' => 'Vue & Extérieur', 'icone' => 'trees'],
            ['nom' => 'Vue sur mer', 'categorie' => 'Vue & Extérieur', 'icone' => 'waves'],
            ['nom' => 'Vue sur jardin', 'categorie' => 'Vue & Extérieur', 'icone' => 'flower'],
            ['nom' => 'Vue sur piscine', 'categorie' => 'Vue & Extérieur', 'icone' => 'droplets'],
            ['nom' => 'Vue sur montagne', 'categorie' => 'Vue & Extérieur', 'icone' => 'mountain'],

            // Accessibilité
            ['nom' => 'Accès handicapé', 'categorie' => 'Accessibilité', 'icone' => 'accessibility'],
            ['nom' => 'Salle de bain adaptée', 'categorie' => 'Accessibilité', 'icone' => 'bath'],
        ];

        foreach ($equipements as $equipement) {
            DB::table('equipements')->insertOrIgnore([
                'nom'        => $equipement['nom'],
                'categorie'  => $equipement['categorie'],
                'icone'      => $equipement['icone'],
                'created_at' => now(),
            ]);
        }
    }
}
