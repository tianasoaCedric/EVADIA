<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('villes_decouverte', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('slug')->unique();
            $table->string('image')->nullable();
            $table->unsignedTinyInteger('ordre')->default(0);
            $table->boolean('actif')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('lieux_decouverte', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ville_id')->constrained('villes_decouverte')->cascadeOnDelete();
            $table->string('nom');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('emplacement')->nullable(); // Ex: "Antananarivo, Madagascar"
            $table->json('images')->nullable(); // photos du carrousel affichées sur la page article
            $table->enum('position_image', ['left', 'right'])->default('left');
            $table->unsignedTinyInteger('ordre')->default(0);
            $table->boolean('actif')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lieux_decouverte');
        Schema::dropIfExists('villes_decouverte');
    }
};
