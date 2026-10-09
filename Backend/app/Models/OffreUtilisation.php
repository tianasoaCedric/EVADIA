<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OffreUtilisation extends Model
{
    protected $table = 'offre_utilisations';
    public $timestamps = false;

    protected $fillable = [
        'avantage_id',
        'reservation_id',
        'client_id',
        'date_utilisation',
        'quantite_utilisee',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'date_utilisation' => 'datetime',
            'quantite_utilisee' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function avantage(): BelongsTo
    {
        return $this->belongsTo(AvantageOffre::class, 'avantage_id');
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
