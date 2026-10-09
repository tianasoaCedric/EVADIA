<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesAndAdminSeeder extends Seeder
{
    /**
     * Seed the roles table and create the initial super_admin user.
     */
    public function run(): void
    {
        // ── Roles ──
        $roles = [
            ['code' => 'super_admin', 'nom' => 'Super Administrateur', 'description' => 'Accès complet à la plateforme', 'niveau' => 100],
            ['code' => 'admin_evadia', 'nom' => 'Admin EVADIA', 'description' => 'Gestion de la plateforme', 'niveau' => 90],
            ['code' => 'admin_hotel', 'nom' => 'Admin Hôtel', 'description' => 'Gestion d\'un hôtel', 'niveau' => 50],
            ['code' => 'gestionnaire_hotel', 'nom' => 'Gestionnaire Hôtel', 'description' => 'Gestion opérationnelle d\'un hôtel', 'niveau' => 40],
            ['code' => 'client', 'nom' => 'Client', 'description' => 'Utilisateur de la plateforme', 'niveau' => 10],
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['code' => $roleData['code']],
                $roleData
            );
        }

        $this->command->info('✅ Roles seeded successfully.');

        // ── Super Admin User ──
        $admin = User::updateOrCreate(
            ['email' => 'admin@evadia.com'],
            [
                'nom' => 'Admin',
                'prenom' => 'EVADIA',
                'password_hash' => Hash::make('Evadia2026!'),
                'email_verified' => true,
                'est_actif' => true,
            ]
        );

        $superAdminRole = Role::where('code', 'super_admin')->first();
        if ($superAdminRole && !$admin->hasRole('super_admin')) {
            $admin->roles()->attach($superAdminRole->id, [
                'assigned_at' => now(),
                'est_actif' => true,
            ]);
        }

        $this->command->info('✅ Super Admin created: admin@evadia.com / Evadia2026!');
    }
}
