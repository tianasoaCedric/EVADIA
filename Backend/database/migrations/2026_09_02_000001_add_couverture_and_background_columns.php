<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->json('couverture')->nullable()->after('image_url');
        });

        Schema::table('villes', function (Blueprint $table) {
            $table->json('couverture')->nullable()->after('image');
        });

        Schema::table('types_hotels', function (Blueprint $table) {
            $table->string('image_background')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn('couverture');
        });

        Schema::table('villes', function (Blueprint $table) {
            $table->dropColumn('couverture');
        });

        Schema::table('types_hotels', function (Blueprint $table) {
            $table->dropColumn('image_background');
        });
    }
};
