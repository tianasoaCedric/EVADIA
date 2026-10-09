<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Disponibilite extends Model
{
    protected $table = 'disponibilites';
    public $timestamps = false;

    protected $fillable = [
        'propriete_id',
        'date',
        'est_disponible',
        'prix_special',
        'devise_prix_special',
        'minimum_nuits',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'est_disponible' => 'boolean',
            'prix_special' => 'decimal:2',
            'minimum_nuits' => 'integer',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
