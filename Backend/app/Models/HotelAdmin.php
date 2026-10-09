<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelAdmin extends Model
{
    protected $table = 'hotel_admins';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'hotel_id',
        'fonction',
        'permissions',
        'est_principal',
        'date_debut',
        'date_fin',
    ];

    protected function casts(): array
    {
        return [
            'est_principal' => 'boolean',
            'date_debut' => 'date',
            'date_fin' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }
}
