<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AvantageOffre extends Model
{
    protected $table = 'avantages_offres';
    public $timestamps = false;

    protected $fillable = [
        'offre_id',
        'type_avantage_id',
        'valeur',
        'quantite_max',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'quantite_max' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function offre(): BelongsTo
    {
        return $this->belongsTo(Offre::class);
    }

    public function type(): BelongsTo
    {
        return $this->belongsTo(TypesAvantage::class, 'type_avantage_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(OffreApplication::class, 'avantage_id');
    }

    public function utilisations(): HasMany
    {
        return $this->hasMany(OffreUtilisation::class, 'avantage_id');
    }
}
