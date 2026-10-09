<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Périodes réellement couvertes par un paiement. La date de fin d'un abonnement
 * dit jusqu'où il court (délai accordé compris) ; cette table dit ce qui a été payé.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('abonnement_paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('abonnement_id')->constrained('abonnements')->onDelete('cascade');
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->date('periode_debut');
            $table->date('periode_fin')->nullable(); // null : abonnement sans fin
            $table->decimal('montant', 10, 2)->nullable();
            $table->string('devise', 3)->nullable();
            // initial : période de départ d'un abonnement · paiement : bouton « Enregistrer un paiement »
            // reprise : périodes antérieures à cette table, considérées comme payées
            $table->string('source', 20)->default('paiement');
            $table->unsignedBigInteger('enregistre_par')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['hotel_id', 'periode_debut'], 'idx_abo_paiement_hotel');
            $table->foreign('enregistre_par')->references('id')->on('users')->onDelete('set null');
        });

        // Reprise : avant cette table, toute la durée d'un abonnement était affichée
        // comme couverte ; on la conserve telle quelle.
        DB::statement("
            INSERT INTO abonnement_paiements (abonnement_id, hotel_id, periode_debut, periode_fin, devise, source, created_at)
            SELECT id, hotel_id, date_debut, date_fin, devise, 'reprise', NOW() FROM abonnements
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('abonnement_paiements');
    }
};
