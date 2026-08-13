<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->boolean('exige_acompte')->default(false)->after('devise_principale');
            $table->decimal('pourcentage_acompte', 5, 2)->nullable()->after('exige_acompte');
        });
    }

    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn(['exige_acompte', 'pourcentage_acompte']);
        });
    }
};
