<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('offres', function (Blueprint $table) {
            // Pourcentage de réduction affiché publiquement sur la carte offre
            $table->unsignedTinyInteger('remise_pct')->default(0)->after('code_promo');

            // Conditions / termes stockés en JSON (tableau de chaînes)
            $table->json('conditions')->nullable()->after('remise_pct');
        });
    }

    public function down(): void
    {
        Schema::table('offres', function (Blueprint $table) {
            $table->dropColumn(['remise_pct', 'conditions']);
        });
    }
};
