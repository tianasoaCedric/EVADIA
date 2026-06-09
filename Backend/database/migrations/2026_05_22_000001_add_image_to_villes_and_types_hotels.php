<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('villes', function (Blueprint $table) {
            $table->string('image')->nullable()->after('nom');
            $table->text('description')->nullable()->after('image');
        });

        Schema::table('types_hotels', function (Blueprint $table) {
            $table->string('image')->nullable()->after('nom');
        });
    }

    public function down(): void
    {
        Schema::table('villes', function (Blueprint $table) {
            $table->dropColumn(['image', 'description']);
        });

        Schema::table('types_hotels', function (Blueprint $table) {
            $table->dropColumn('image');
        });
    }
};
