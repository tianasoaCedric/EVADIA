<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Pauses d'abonnement décidées par Evadia. L'hôtel est retiré du site
 * de date_debut (incluse) à date_reprise (exclue : il réapparaît ce jour-là).
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('abonnement_pauses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('abonnement_id')->constrained('abonnements')->onDelete('cascade');
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->date('date_debut');
            $table->date('date_reprise');
            // planifiee → en_cours → terminee, ou annulee avant son début
            $table->string('statut', 20)->default('planifiee');
            $table->text('raison')->nullable();
            // Jours payés non utilisés, rendus à la reprise (report d'échéance)
            $table->unsignedInteger('jours_reportes')->nullable();
            $table->boolean('rappel_reprise_envoye')->default(false);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('ended_by')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('ended_at')->nullable();

            $table->index(['hotel_id', 'statut'], 'idx_abo_pause_hotel');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('ended_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonnement_pauses');
    }
};
