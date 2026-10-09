<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->string('code_promo_utilise', 50)->nullable()->after('demande_speciale');
            $table->foreignId('offre_id')->nullable()->constrained('offres')->nullOnDelete()->after('code_promo_utilise');
            $table->decimal('prix_avant_reduction', 10, 2)->nullable()->after('offre_id');
            $table->decimal('montant_reduction', 10, 2)->default(0)->after('prix_avant_reduction');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['offre_id']);
            $table->dropColumn(['code_promo_utilise', 'offre_id', 'prix_avant_reduction', 'montant_reduction']);
        });
    }
};
