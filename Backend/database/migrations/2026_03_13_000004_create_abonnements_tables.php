<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('abonnements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->string('type_abonnement', 50);
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->decimal('prix_mensuel', 10, 2);
            $table->string('devise', 3)->default('EUR');
            $table->timestamp('created_at')->useCurrent();

            $table->index('hotel_id', 'idx_abonnement_hotel');
        });

        Schema::create('abonnement_historique', function (Blueprint $table) {
            $table->id();
            $table->foreignId('abonnement_id')->constrained('abonnements')->onDelete('cascade');
            $table->string('type_abonnement', 50);
            $table->date('date_debut');
            $table->date('date_fin')->nullable();
            $table->decimal('prix_mensuel', 10, 2);
            $table->string('statut', 20)->default('actif');
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('abonnement_id', 'idx_abonnement_histo');
            $table->index(['date_debut', 'date_fin'], 'idx_abonnement_periode');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abonnement_historique');
        Schema::dropIfExists('abonnements');
    }
};
