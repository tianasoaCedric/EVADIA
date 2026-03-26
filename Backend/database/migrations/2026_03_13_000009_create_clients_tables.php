<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('profils_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->date('date_naissance')->nullable();
            $table->string('nationalite', 100)->nullable();
            $table->text('preferences')->nullable();
            $table->string('langue_preferee', 10)->default('fr');
            $table->integer('points_fidelite')->default(0);

            $table->index('user_id', 'idx_profil_user');
        });

        Schema::create('adresses_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profil_client_id')->constrained('profils_clients')->onDelete('cascade');
            $table->string('type_adresse', 20);
            $table->string('adresse_ligne1', 255);
            $table->string('adresse_ligne2', 255)->nullable();
            $table->string('code_postal', 20);
            $table->string('ville', 100);
            $table->string('pays', 100);
            $table->boolean('est_defaut')->default(false);

            $table->index('profil_client_id', 'idx_adresse_client');
        });

        Schema::create('methodes_paiement', function (Blueprint $table) {
            $table->id();
            $table->foreignId('profil_client_id')->constrained('profils_clients')->onDelete('cascade');
            $table->string('type_paiement', 20);
            $table->string('token_paiement', 255)->nullable();
            $table->string('derniers_4_chiffres', 4)->nullable();
            $table->string('date_expiration', 7)->nullable();
            $table->string('titulaire', 200)->nullable();
            $table->string('devise_par_defaut', 3)->default('EUR');
            $table->boolean('est_defaut')->default(false);
            $table->timestamp('date_ajout')->useCurrent();

            $table->index('profil_client_id', 'idx_paiement_client');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('methodes_paiement');
        Schema::dropIfExists('adresses_clients');
        Schema::dropIfExists('profils_clients');
    }
};
