<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('reservation_id')->nullable()->after('destinataire_id')
                ->constrained('reservations')->onDelete('cascade');

            $table->index('reservation_id', 'idx_msg_reservation');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['reservation_id']);
            $table->dropColumn('reservation_id');
        });
    }
};
