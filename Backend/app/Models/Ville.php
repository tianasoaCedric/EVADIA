<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ville extends Model
{
    protected $table = 'villes';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'image',
        'couverture',
        'description',
        'destination_id',
        'code_postal',
        'latitude',
        'longitude',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'couverture' => 'array',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'created_at' => 'datetime',
        ];
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class, 'entite_id')
            ->where('entite_type', 'ville')
            ->orderBy('ordre');
    }
}
