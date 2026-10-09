<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->decimal('montant_acompte', 10, 2)->nullable()->after('prix_total');
            $table->string('statut_paiement_acompte', 20)->default('non_requis')->after('montant_acompte');
            $table->timestamp('date_paiement_acompte')->nullable()->after('statut_paiement_acompte');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['montant_acompte', 'statut_paiement_acompte', 'date_paiement_acompte']);
        });
    }
};
