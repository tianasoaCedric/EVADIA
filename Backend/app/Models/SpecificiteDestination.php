<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SpecificiteDestination extends Model
{
    protected $table = 'specificites_destination';
    public $timestamps = false;

    protected $fillable = [
        'nom',
        'description',
        'type_specificite',
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

    public function destinations(): BelongsToMany
    {
        return $this->belongsToMany(Destination::class, 'destination_specificites', 'specificite_id', 'destination_id');
    }
}
