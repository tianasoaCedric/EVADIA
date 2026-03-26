<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destination extends Model
{
    protected $table = 'destinations';
    public $timestamps = false;

    protected $fillable = ['nom', 'description', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function villes(): HasMany
    {
        return $this->hasMany(Ville::class);
    }

    public function specificites(): BelongsToMany
    {
        return $this->belongsToMany(SpecificiteDestination::class, 'destination_specificites', 'destination_id', 'specificite_id');
    }

    public function hotels(): BelongsToMany
    {
        return $this->belongsToMany(Hotel::class, 'hotel_destinations');
    }
}
