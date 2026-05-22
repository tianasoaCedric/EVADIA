<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TypesHotel extends Model
{
    protected $table = 'types_hotels';
    public $timestamps = false;

    protected $fillable = ['nom', 'image', 'description', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function hotels(): BelongsToMany
    {
        return $this->belongsToMany(Hotel::class, 'hotel_types', 'type_hotel_id', 'hotel_id');
    }
}
