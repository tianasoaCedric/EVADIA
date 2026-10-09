<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('politiques_annulation', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->constrained('proprietes')->onDelete('cascade');
            $table->string('nom', 100);
            $table->integer('delai_heures');
            $table->decimal('penalite_pourcentage', 5, 2);
            $table->decimal('remboursement_pourcentage', 5, 2);
            $table->boolean('est_active')->default(true);
            $table->timestamp('created_at')->useCurrent();

            $table->index('propriete_id', 'idx_politique_propriete');
        });

        Schema::create('reservation_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->onDelete('cascade');
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->integer('quantite')->default(1);
            $table->decimal('prix_unitaire', 10, 2);
            $table->string('devise', 3);
            $table->date('date_service')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('reservation_id', 'idx_res_service_reservation');
            $table->index('service_id', 'idx_res_service_service');
        });

        Schema::create('favoris', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'hotel_id'], 'unique_favori');
            $table->index('user_id', 'idx_favori_user');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('type_notification', 50);
            $table->string('titre', 255);
            $table->text('contenu');
            $table->string('lien', 255)->nullable();
            $table->boolean('lu')->default(false);
            $table->string('canal', 20)->default('in_app');
            $table->unsignedBigInteger('reservation_id')->nullable();
            $table->timestamp('date_envoi')->useCurrent();
            $table->timestamp('date_lecture')->nullable();

            $table->index(['user_id', 'lu'], 'idx_notif_user_lu');
            $table->index('type_notification', 'idx_notif_type');
            $table->index('date_envoi', 'idx_notif_date');
            $table->foreign('reservation_id')->references('id')->on('reservations')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('favoris');
        Schema::dropIfExists('reservation_services');
        Schema::dropIfExists('politiques_annulation');
    }
};
