<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Facture extends Model
{
    protected $table = 'factures';
    public $timestamps = false;

    protected $fillable = [
        'reservation_id',
        'numero_facture',
        'date_emission',
        'montant_total',
        'devise',
    ];

    protected function casts(): array
    {
        return [
            'date_emission' => 'datetime',
            'montant_total' => 'decimal:2',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
