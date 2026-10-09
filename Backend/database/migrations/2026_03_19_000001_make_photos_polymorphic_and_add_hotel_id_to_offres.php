<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // ─── 1. Convert photos table to polymorphic ───────────────
        Schema::table('photos', function (Blueprint $table) {
            // Add polymorphic columns
            $table->string('entite_type', 50)->default('propriete')->after('id');
            $table->unsignedBigInteger('entite_id')->nullable()->after('entite_type');
        });

        // Migrate existing data: set entite_type='propriete' and entite_id=propriete_id
        DB::statement("UPDATE photos SET entite_type = 'propriete', entite_id = propriete_id");

        // Drop old foreign key and column
        Schema::table('photos', function (Blueprint $table) {
            $table->dropForeign(['propriete_id']);
            $table->dropIndex('idx_photo_propriete');
            $table->dropColumn('propriete_id');
        });

        // Add polymorphic index
        Schema::table('photos', function (Blueprint $table) {
            $table->index(['entite_type', 'entite_id'], 'idx_photo_entite');
        });

        // ─── 2. Migrate hotel_photos to photos table ─────────────
        DB::statement("
            INSERT INTO photos (entite_type, entite_id, url_photo, legende, ordre, est_principale, uploaded_by, date_upload)
            SELECT 'hotel', hotel_id, url_photo, legende, ordre, est_principale, uploaded_by, date_upload
            FROM hotel_photos
        ");

        // Drop hotel_photos table (no longer needed)
        Schema::dropIfExists('hotel_photos');

        // ─── 3. Add hotel_id to offres table ─────────────────────
        Schema::table('offres', function (Blueprint $table) {
            $table->unsignedBigInteger('hotel_id')->nullable()->after('id');
            $table->foreign('hotel_id')->references('id')->on('hotels')->onDelete('cascade');
            $table->index('hotel_id', 'idx_offre_hotel');
        });
    }

    public function down(): void
    {
        // Restore hotel_id on offres
        Schema::table('offres', function (Blueprint $table) {
            $table->dropForeign(['hotel_id']);
            $table->dropIndex('idx_offre_hotel');
            $table->dropColumn('hotel_id');
        });

        // Recreate hotel_photos table
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

        // Move hotel photos back
        DB::statement("
            INSERT INTO hotel_photos (hotel_id, url_photo, legende, ordre, est_principale, uploaded_by, date_upload)
            SELECT entite_id, url_photo, legende, ordre, est_principale, uploaded_by, date_upload
            FROM photos WHERE entite_type = 'hotel'
        ");

        // Delete hotel photos from photos table
        DB::statement("DELETE FROM photos WHERE entite_type = 'hotel'");

        // Restore propriete_id column
        Schema::table('photos', function (Blueprint $table) {
            $table->dropIndex('idx_photo_entite');
            $table->unsignedBigInteger('propriete_id')->nullable()->after('id');
        });

        DB::statement("UPDATE photos SET propriete_id = entite_id WHERE entite_type = 'propriete'");

        Schema::table('photos', function (Blueprint $table) {
            $table->dropColumn(['entite_type', 'entite_id']);
            $table->foreign('propriete_id')->references('id')->on('proprietes')->onDelete('cascade');
            $table->index('propriete_id', 'idx_photo_propriete');
        });
    }
};
