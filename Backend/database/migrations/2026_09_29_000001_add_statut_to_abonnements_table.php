<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('abonnements', function (Blueprint $table) {
            $table->string('statut', 20)->default('actif')->after('devise');
            $table->json('rappels_envoyes')->nullable()->after('statut');
            $table->index('statut', 'idx_abonnement_statut');
            $table->index('date_fin', 'idx_abonnement_date_fin');
        });
    }

    public function down(): void
    {
        Schema::table('abonnements', function (Blueprint $table) {
            $table->dropIndex('idx_abonnement_statut');
            $table->dropIndex('idx_abonnement_date_fin');
            $table->dropColumn(['statut', 'rappels_envoyes']);
        });
    }
};
