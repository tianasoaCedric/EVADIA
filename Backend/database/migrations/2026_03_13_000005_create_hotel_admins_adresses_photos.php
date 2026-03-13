<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('hotel_admins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->string('fonction', 100)->nullable();
            $table->text('permissions')->nullable();
            $table->boolean('est_principal')->default(false);
            $table->date('date_debut');
            $table->date('date_fin')->nullable();

            $table->unique(['user_id', 'hotel_id'], 'unique_admin_hotel');
            $table->index('hotel_id', 'idx_ha_hotel');
            $table->index('user_id', 'idx_ha_user');
        });

        Schema::create('adresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->unique()->constrained('hotels')->onDelete('cascade');
            $table->string('adresse_ligne1', 255);
            $table->string('adresse_ligne2', 255)->nullable();
            $table->string('code_postal', 20);
            $table->string('ville', 100);
            $table->string('pays', 100);
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
        });

        Schema::create('hotel_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->text('url_photo');
            $table->string('legende', 255)->nullable();
            $table->integer('ordre')->default(0);
            $table->boolean('est_principale')->default(false);
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamp('date_upload')->useCurrent();

            $table->index('hotel_id', 'idx_photo_hotel');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hotel_photos');
        Schema::dropIfExists('adresses');
        Schema::dropIfExists('hotel_admins');
    }
};
