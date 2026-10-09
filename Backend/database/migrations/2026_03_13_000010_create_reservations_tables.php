<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('code_reservation', 20)->unique();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('propriete_id')->constrained('proprietes')->onDelete('cascade');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->integer('nb_adultes');
            $table->integer('nb_enfants')->default(0);
            $table->integer('nb_bebes')->default(0);
            $table->decimal('prix_total', 10, 2);
            $table->string('devise_prix_total', 3);
            $table->string('statut', 20)->default('draft');
            $table->timestamp('date_reservation')->useCurrent();
            $table->text('demande_speciale')->nullable();
            $table->unsignedBigInteger('annulee_par')->nullable();
            $table->text('raison_annulation')->nullable();

            $table->index('client_id', 'idx_res_client');
            $table->index('propriete_id', 'idx_res_propriete');
            $table->index(['date_debut', 'date_fin'], 'idx_res_dates');
            $table->index('code_reservation', 'idx_res_code');
            $table->foreign('annulee_par')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->decimal('montant', 10, 2);
            $table->string('devise_montant', 3);
            $table->unsignedBigInteger('methode_paiement_id')->nullable();
            $table->string('statut', 20)->default('pending');
            $table->string('transaction_id', 255)->nullable();
            $table->timestamp('date_paiement')->useCurrent();

            $table->index('reservation_id', 'idx_paiement_reservation');
            $table->index('transaction_id', 'idx_transaction');
            $table->foreign('methode_paiement_id')->references('id')->on('methodes_paiement')->onDelete('set null');
        });

        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->unique()->constrained('reservations')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('propriete_id')->constrained('proprietes')->onDelete('cascade');
            $table->integer('note');
            $table->text('commentaire')->nullable();
            $table->text('reponse_hotel')->nullable();
            $table->timestamp('date_avis')->useCurrent();
            $table->timestamp('date_reponse')->nullable();
            $table->boolean('signale_abus')->default(false);

            $table->index('propriete_id', 'idx_avis_propriete');
            $table->index('client_id', 'idx_avis_client');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
        Schema::dropIfExists('paiements');
        Schema::dropIfExists('reservations');
    }
};
