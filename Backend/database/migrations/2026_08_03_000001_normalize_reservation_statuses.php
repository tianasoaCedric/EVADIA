<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::table('reservations')->where('statut', 'draft')->update(['statut' => 'en_attente']);
        DB::table('reservations')->where('statut', 'pending')->update(['statut' => 'en_attente']);
        DB::table('reservations')->where('statut', 'paid')->update(['statut' => 'acceptee']);
        DB::table('reservations')->where('statut', 'confirmee')->update(['statut' => 'acceptee']);
        DB::table('reservations')->where('statut', 'cancelled')->update(['statut' => 'annulee']);
    }

    public function down(): void
    {
        DB::table('reservations')->where('statut', 'acceptee')->update(['statut' => 'confirmee']);
        DB::table('reservations')->where('statut', 'annulee')->update(['statut' => 'cancelled']);
        DB::table('reservations')->where('statut', 'en_attente')->update(['statut' => 'pending']);
    }
};
