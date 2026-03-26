<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Adresse extends Model
{
    protected $table = 'adresses';
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'adresse_ligne1',
        'adresse_ligne2',
        'code_postal',
        'ville',
        'pays',
        'latitude',
        'longitude',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }
}
