<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('proprietes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->string('nom', 200);
            $table->text('description')->nullable();
            $table->string('type_propriete', 50);
            $table->integer('capacite');
            $table->integer('nb_chambres')->nullable();
            $table->integer('nb_lits')->nullable();
            $table->integer('nb_salles_bain')->nullable();
            $table->integer('superficie')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('hotel_id', 'idx_propriete_hotel');
            $table->index('type_propriete', 'idx_propriete_type');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('propriete_prix', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->constrained('proprietes')->onDelete('cascade');
            $table->decimal('prix', 10, 2);
            $table->string('devise', 3);
            $table->dateTime('date_debut');
            $table->dateTime('date_fin')->nullable();
            $table->text('raison')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['propriete_id', 'date_debut', 'date_fin'], 'idx_prix_periode');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('propriete_statuts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->constrained('proprietes')->onDelete('cascade');
            $table->string('statut', 20);
            $table->dateTime('date_debut');
            $table->dateTime('date_fin')->nullable();
            $table->text('raison')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['propriete_id', 'date_debut', 'date_fin'], 'idx_statut_periode');
            $table->foreign('changed_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->constrained('proprietes')->onDelete('cascade');
            $table->text('url_photo');
            $table->string('legende', 255)->nullable();
            $table->integer('ordre')->default(0);
            $table->boolean('est_principale')->default(false);
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamp('date_upload')->useCurrent();

            $table->index('propriete_id', 'idx_photo_propriete');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('equipements', function (Blueprint $table) {
            $table->id();
            $table->string('nom', 100);
            $table->string('icone', 50)->nullable();
            $table->string('categorie', 50);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('propriete_equipements', function (Blueprint $table) {
            $table->foreignId('propriete_id')->constrained('proprietes')->onDelete('cascade');
            $table->foreignId('equipement_id')->constrained('equipements')->onDelete('cascade');
            $table->integer('quantite')->default(1);

            $table->primary(['propriete_id', 'equipement_id']);
        });

        Schema::create('disponibilites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->constrained('proprietes')->onDelete('cascade');
            $table->date('date');
            $table->boolean('est_disponible')->default(true);
            $table->decimal('prix_special', 10, 2)->nullable();
            $table->string('devise_prix_special', 3)->nullable();
            $table->integer('minimum_nuits')->default(1);
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->unique(['propriete_id', 'date'], 'unique_dispo');
            $table->index('date', 'idx_dispo_date');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disponibilites');
        Schema::dropIfExists('propriete_equipements');
        Schema::dropIfExists('equipements');
        Schema::dropIfExists('photos');
        Schema::dropIfExists('propriete_statuts');
        Schema::dropIfExists('propriete_prix');
        Schema::dropIfExists('proprietes');
    }
};
