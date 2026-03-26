<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReservationService extends Model
{
    protected $table = 'reservation_services';
    public $timestamps = false;

    protected $fillable = [
        'reservation_id',
        'service_id',
        'quantite',
        'prix_unitaire',
        'devise',
        'date_service',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'quantite' => 'integer',
            'prix_unitaire' => 'decimal:2',
            'date_service' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
