<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('propriete_prix', function (Blueprint $table) {
            // Prix en Ariary malgache (obligatoire — devise de référence)
            $table->decimal('prix_mga', 12, 2)->default(0)->after('prix');
            // Prix en euros (optionnel)
            $table->decimal('prix_eur', 10, 2)->nullable()->after('prix_mga');
        });
    }

    public function down(): void
    {
        Schema::table('propriete_prix', function (Blueprint $table) {
            $table->dropColumn(['prix_mga', 'prix_eur']);
        });
    }
};
