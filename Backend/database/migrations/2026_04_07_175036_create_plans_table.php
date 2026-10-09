<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('nom', 100);
            $table->string('label', 50);
            $table->string('description')->nullable();
            $table->decimal('prix', 12, 2)->default(0);
            $table->string('devise', 3)->default('MGA');
            $table->json('features');
            $table->string('badge_bg', 50)->default('bg-gray-100');
            $table->string('badge_text', 50)->default('text-gray-700');
            $table->string('border', 50)->default('border-gray-400');
            $table->boolean('est_actif')->default(true);
            $table->unsignedTinyInteger('ordre')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
