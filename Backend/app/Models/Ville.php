<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ville extends Model
{
    protected $table = 'villes';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'image',
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
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'created_at' => 'datetime',
        ];
    }

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}
