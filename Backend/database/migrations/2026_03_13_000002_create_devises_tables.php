<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('devises', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('nom', 50);
            $table->string('symbole', 5);
            $table->boolean('est_active')->default(true);
            $table->string('source_principale', 50)->default('openexchangerates');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->index('code', 'idx_devise_code');
        });

        Schema::create('taux_change', function (Blueprint $table) {
            $table->id();
            $table->foreignId('devise_source_id')->constrained('devises')->onDelete('cascade');
            $table->foreignId('devise_cible_id')->constrained('devises')->onDelete('cascade');
            $table->decimal('taux', 10, 4);
            $table->date('date_effective');
            $table->string('source', 50);
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['devise_source_id', 'devise_cible_id', 'date_effective'], 'unique_taux');
            $table->index('date_effective', 'idx_taux_date');
        });

        Schema::create('sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('source', 50);
            $table->timestamp('date_sync')->useCurrent();
            $table->string('statut', 20);
            $table->integer('nb_taux_importes')->default(0);
            $table->text('message')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('date_sync', 'idx_sync_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_logs');
        Schema::dropIfExists('taux_change');
        Schema::dropIfExists('devises');
    }
};
