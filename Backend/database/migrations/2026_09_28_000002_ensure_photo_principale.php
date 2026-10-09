<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Répare les hôtels / chambres qui ont des photos mais aucune principale
     * (ex. principale supprimée avant que la promotion automatique n'existe) :
     * la première photo par ordre devient principale.
     */
    public function up(): void
    {
        DB::statement(<<<'SQL'
            UPDATE photos SET est_principale = true
            WHERE id IN (
                SELECT DISTINCT ON (p.entite_type, p.entite_id) p.id
                FROM photos p
                WHERE p.entite_type IN ('hotel', 'propriete')
                  AND NOT EXISTS (
                      SELECT 1 FROM photos x
                      WHERE x.entite_type = p.entite_type
                        AND x.entite_id = p.entite_id
                        AND x.est_principale = true
                  )
                ORDER BY p.entite_type, p.entite_id, p.ordre, p.id
            )
        SQL);
    }

    public function down(): void
    {
        // Réparation de données : rien à annuler.
    }
};
