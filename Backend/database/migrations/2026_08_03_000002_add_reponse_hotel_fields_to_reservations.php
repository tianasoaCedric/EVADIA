<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedBigInteger('repondue_par')->nullable()->after('annulee_par');
            $table->timestamp('date_reponse')->nullable()->after('date_reservation');
            $table->text('raison_refus')->nullable()->after('raison_annulation');

            $table->foreign('repondue_par')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['repondue_par']);
            $table->dropColumn(['repondue_par', 'date_reponse', 'raison_refus']);
        });
    }
};
