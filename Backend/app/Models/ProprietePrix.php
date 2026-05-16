<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProprietePrix extends Model
{
    protected $table = 'propriete_prix';
    public $timestamps = false;

    protected $fillable = [
        'propriete_id',
        'prix',
        'devise',
        'prix_mga',
        'prix_eur',
        'date_debut',
        'date_fin',
        'raison',
        'changed_by',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'prix'       => 'decimal:2',
            'prix_mga'   => 'decimal:2',
            'prix_eur'   => 'decimal:2',
            'date_debut' => 'datetime',
            'date_fin'   => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    /**
     * Retourne le prix dans la devise demandée.
     * Par défaut MGA. Si la devise n'est pas disponible, retourne MGA.
     */
    public function getPrixPourDevise(string $devise): float
    {
        return match (strtoupper($devise)) {
            'EUR' => (float) ($this->prix_eur ?? $this->prix_mga),
            default => (float) $this->prix_mga,
        };
    }

    /**
     * Alias lisible — prix par nuit en MGA (référence)
     */
    public function getPrixParNuitAttribute(): float
    {
        return (float) $this->prix_mga;
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
