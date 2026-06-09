<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->decimal('note_moyenne', 3, 2)->default(0)->after('etoiles');
            $table->unsignedInteger('nb_avis')->default(0)->after('note_moyenne');
        });

        // Recalcul initial pour les avis existants
        DB::statement("
            UPDATE hotels h
            SET
                note_moyenne = COALESCE((
                    SELECT ROUND(AVG(a.note), 2)
                    FROM avis a
                    INNER JOIN proprietes p ON a.propriete_id = p.id
                    WHERE p.hotel_id = h.id
                ), 0),
                nb_avis = COALESCE((
                    SELECT COUNT(*)
                    FROM avis a
                    INNER JOIN proprietes p ON a.propriete_id = p.id
                    WHERE p.hotel_id = h.id
                ), 0)
        ");
    }

    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn(['note_moyenne', 'nb_avis']);
        });
    }
};
