<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stock d'unités identiques pour ce type (ex. 10 chambres « Standard »).
        // Une date n'est complète que lorsque toutes les unités sont réservées.
        Schema::table('proprietes', function (Blueprint $table) {
            $table->unsignedInteger('nombre_unites')->default(1)->after('type_propriete');
        });
    }

    public function down(): void
    {
        Schema::table('proprietes', function (Blueprint $table) {
            $table->dropColumn('nombre_unites');
        });
    }
};
