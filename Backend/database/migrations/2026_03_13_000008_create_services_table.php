<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');
            $table->string('nom', 200);
            $table->text('description')->nullable();
            $table->string('type_service', 50)->nullable();
            $table->decimal('tarif', 10, 2)->nullable();
            $table->string('devise', 3)->default('EUR');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent();

            $table->index('hotel_id', 'idx_service_hotel');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
