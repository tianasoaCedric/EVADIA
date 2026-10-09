<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('langues', function (Blueprint $table) {
            $table->id();
            $table->string('code', 2)->unique();
            $table->string('nom', 50);
            $table->string('drapeau', 10)->nullable();
            $table->boolean('est_active')->default(true);
            $table->boolean('est_defaut')->default(false);
            $table->integer('ordre_affichage')->default(0);
            $table->timestamp('created_at')->useCurrent();

            $table->index('code', 'idx_langue_code');
        });

        Schema::create('traductions', function (Blueprint $table) {
            $table->id();
            $table->string('table_name', 50);
            $table->string('champ_name', 50);
            $table->unsignedBigInteger('record_id');
            $table->foreignId('langue_id')->constrained('langues')->onDelete('cascade');
            $table->text('valeur');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->unique(['table_name', 'champ_name', 'record_id', 'langue_id'], 'unique_traduction');
            $table->index('langue_id', 'idx_trad_langue');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('traductions');
        Schema::dropIfExists('langues');
    }
};
