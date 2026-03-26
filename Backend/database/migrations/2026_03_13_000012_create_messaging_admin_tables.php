<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('expediteur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('destinataire_id')->constrained('users')->onDelete('cascade');
            $table->string('sujet', 255)->nullable();
            $table->text('contenu');
            $table->boolean('lu')->default(false);
            $table->timestamp('date_envoi')->useCurrent();

            $table->index('expediteur_id', 'idx_msg_expediteur');
            $table->index('destinataire_id', 'idx_msg_destinataire');
            $table->index('lu', 'idx_msg_lu');
            $table->index('date_envoi', 'idx_msg_date');
        });

        Schema::create('logs_admin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->onDelete('cascade');
            $table->string('action', 255);
            $table->text('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('date_action')->useCurrent();

            $table->index('admin_id', 'idx_logs_admin');
            $table->index('date_action', 'idx_logs_date');
        });

        Schema::create('configuration', function (Blueprint $table) {
            $table->id();
            $table->string('cle_config', 100)->unique();
            $table->text('valeur_config');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamp('updated_at')->useCurrent();

            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
        });

        Schema::create('statistiques_plateforme', function (Blueprint $table) {
            $table->id();
            $table->date('date_stat')->unique();
            $table->integer('nb_nouveaux_clients')->default(0);
            $table->integer('nb_nouveaux_hotels')->default(0);
            $table->integer('nb_reservations')->default(0);
            $table->decimal('ca_total', 15, 2)->default(0);
            $table->decimal('commission_totale', 15, 2)->default(0);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistiques_plateforme');
        Schema::dropIfExists('configuration');
        Schema::dropIfExists('logs_admin');
        Schema::dropIfExists('messages');
    }
};
