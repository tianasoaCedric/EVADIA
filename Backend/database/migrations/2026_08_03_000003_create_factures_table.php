<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->unique()->constrained('reservations')->onDelete('cascade');
            $table->string('numero_facture', 30)->unique();
            $table->timestamp('date_emission')->useCurrent();
            $table->decimal('montant_total', 10, 2);
            $table->string('devise', 3);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
