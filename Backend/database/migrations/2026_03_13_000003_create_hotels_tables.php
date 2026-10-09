<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('hotels', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 200);
            $table->text('description')->nullable();
            $table->string('email_contact', 255)->nullable();
            $table->string('telephone', 20)->nullable();
            $table->string('site_web', 255)->nullable();
            $table->integer('etoiles')->nullable();
            $table->string('devise_principale', 3)->default('EUR');
            $table->timestamp('date_creation')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->index('created_by', 'idx_hotel_createur');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('types_hotels', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('hotel_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->foreignId('type_hotel_id')->constrained('types_hotels')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['hotel_id', 'type_hotel_id'], 'unique_hotel_type');
        });

        Schema::create('hotel_statuts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->string('statut', 20);
            $table->dateTime('date_debut');
            $table->dateTime('date_fin')->nullable();
            $table->text('raison')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['hotel_id', 'date_debut', 'date_fin'], 'idx_hotel_statut_periode');
            $table->index('statut', 'idx_hotel_statut_type');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_statuts');
        Schema::dropIfExists('hotel_types');
        Schema::dropIfExists('types_hotels');
        Schema::dropIfExists('hotels');
    }
};
