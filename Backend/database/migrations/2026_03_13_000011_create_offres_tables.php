<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('offres', function (Blueprint $table) {
            $table->id();
            $table->string('titre', 200);
            $table->text('description')->nullable();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->string('code_promo', 50)->unique()->nullable();
            $table->string('statut', 20)->default('active');
            $table->timestamp('created_at')->useCurrent();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->index(['date_debut', 'date_fin'], 'idx_offres_dates');
            $table->index('code_promo', 'idx_code_promo');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('types_avantages', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('nom', 100);
            $table->text('description')->nullable();
        });

        Schema::create('avantages_offres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('offre_id')->constrained('offres')->onDelete('cascade');
            $table->foreignId('type_avantage_id')->constrained('types_avantages')->onDelete('cascade');
            $table->text('valeur');
            $table->integer('quantite_max')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('offre_id', 'idx_avantage_offre');
        });

        Schema::create('offre_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('avantage_id')->constrained('avantages_offres')->onDelete('cascade');
            $table->string('entite_type', 50);
            $table->unsignedBigInteger('entite_id');
            $table->timestamp('created_at')->useCurrent();

            $table->index('avantage_id', 'idx_appli_avantage');
            $table->index(['entite_type', 'entite_id'], 'idx_appli_entite');
        });

        Schema::create('offre_utilisations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('avantage_id')->constrained('avantages_offres')->onDelete('cascade');
            $table->unsignedBigInteger('reservation_id')->nullable();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('date_utilisation')->useCurrent();
            $table->integer('quantite_utilisee')->default(1);
            $table->timestamp('created_at')->useCurrent();

            $table->index('avantage_id', 'idx_util_avantage');
            $table->index('reservation_id', 'idx_util_reservation');
            $table->index('client_id', 'idx_util_client');
            $table->foreign('reservation_id')->references('id')->on('reservations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offre_utilisations');
        Schema::dropIfExists('offre_applications');
        Schema::dropIfExists('avantages_offres');
        Schema::dropIfExists('types_avantages');
        Schema::dropIfExists('offres');
    }
};
