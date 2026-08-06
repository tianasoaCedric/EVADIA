<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::dropIfExists('paiements');
    }

    public function down(): void
    {
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
    }
};
