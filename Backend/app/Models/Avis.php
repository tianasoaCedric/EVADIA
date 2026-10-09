<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Avis extends Model
{
    protected $table = 'avis';
    public $timestamps = false;

    protected $fillable = [
        'reservation_id',
        'client_id',
        'propriete_id',
        'note',
        'commentaire',
        'reponse_hotel',
        'date_avis',
        'date_reponse',
        'signale_abus',
    ];

    protected function casts(): array
    {
        return [
            'note' => 'integer',
            'signale_abus' => 'boolean',
            'date_avis' => 'datetime',
            'date_reponse' => 'datetime',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }
}
