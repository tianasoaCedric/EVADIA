<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'code' => 'super_admin',
                'nom' => 'Super Administrateur',
                'niveau' => 1,
                'description' => 'Accès complet à toutes les fonctionnalités du système',
            ],
            [
                'code' => 'admin_evadia',
                'nom' => 'Administrateur Evadia',
                'niveau' => 2,
                'description' => 'Gestion de la plateforme Evadia',
            ],
            [
                'code' => 'admin_hotel',
                'nom' => 'Administrateur Hôtel',
                'niveau' => 3,
                'description' => 'Gestion d\'un établissement hôtelier',
            ],
            [
                'code' => 'client',
                'nom' => 'Client',
                'niveau' => 4,
                'description' => 'Utilisateur de la plateforme',
            ],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['code' => $role['code']],
                $role
            );
        }
    }
}
