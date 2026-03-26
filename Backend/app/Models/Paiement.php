<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    protected $table = 'paiements';
    public $timestamps = false;

    protected $fillable = [
        'reservation_id',
        'montant',
        'devise_montant',
        'methode_paiement_id',
        'statut',
        'transaction_id',
        'date_paiement',
    ];

    protected function casts(): array
    {
        return [
            'montant' => 'decimal:2',
            'date_paiement' => 'datetime',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function methodePaiement(): BelongsTo
    {
        return $this->belongsTo(MethodePaiement::class, 'methode_paiement_id');
    }
}
