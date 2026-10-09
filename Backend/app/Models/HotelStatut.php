<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelStatut extends Model
{
    protected $table = 'hotel_statuts';
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'statut',
        'date_debut',
        'date_fin',
        'raison',
        'changed_by',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'datetime',
            'date_fin' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
