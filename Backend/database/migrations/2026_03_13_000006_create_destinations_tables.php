<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('villes', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->foreignId('destination_id')->constrained('destinations')->onDelete('cascade');
            $table->string('code_postal', 20)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('destination_id', 'idx_ville_destination');
        });

        Schema::create('specificites_destination', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 200);
            $table->text('description')->nullable();
            $table->string('type_specificite', 50)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('destination_specificites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained('destinations')->onDelete('cascade');
            $table->foreignId('specificite_id')->constrained('specificites_destination')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['destination_id', 'specificite_id'], 'unique_destination_specificite');
        });

        Schema::create('hotel_destinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->foreignId('destination_id')->constrained('destinations')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['hotel_id', 'destination_id'], 'unique_hotel_destination');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_destinations');
        Schema::dropIfExists('destination_specificites');
        Schema::dropIfExists('specificites_destination');
        Schema::dropIfExists('villes');
        Schema::dropIfExists('destinations');
    }
};
