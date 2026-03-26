<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PolitiqueAnnulation extends Model
{
    protected $table = 'politiques_annulation';
    public $timestamps = false;

    protected $fillable = [
        'propriete_id',
        'nom',
        'delai_heures',
        'penalite_pourcentage',
        'remboursement_pourcentage',
        'est_active',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'delai_heures' => 'integer',
            'penalite_pourcentage' => 'decimal:2',
            'remboursement_pourcentage' => 'decimal:2',
            'est_active' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }
}
