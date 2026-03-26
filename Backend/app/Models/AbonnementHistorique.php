<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AbonnementHistorique extends Model
{
    protected $table = 'abonnement_historique';
    public $timestamps = false;

    protected $fillable = [
        'abonnement_id',
        'type_abonnement',
        'date_debut',
        'date_fin',
        'prix_mensuel',
        'statut',
        'changed_by',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'prix_mensuel' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function abonnement(): BelongsTo
    {
        return $this->belongsTo(Abonnement::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
