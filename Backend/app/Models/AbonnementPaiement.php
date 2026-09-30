<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class AbonnementPaiement extends Model
{
    protected $table = 'abonnement_paiements';
    public $timestamps = false;

    const SOURCE_INITIAL = 'initial';
    const SOURCE_PAIEMENT = 'paiement';
    const SOURCE_REPRISE = 'reprise';
    /** Jours payés non utilisés pendant une pause, rendus à la reprise. */
    const SOURCE_REPORT = 'report';

    protected $fillable = [
        'abonnement_id',
        'hotel_id',
        'periode_debut',
        'periode_fin',
        'montant',
        'devise',
        'source',
        'enregistre_par',
    ];

    protected function casts(): array
    {
        return [
            'periode_debut' => 'date',
            'periode_fin'   => 'date',
            'montant'       => 'decimal:2',
            'created_at'    => 'datetime',
        ];
    }

    public function abonnement(): BelongsTo
    {
        return $this->belongsTo(Abonnement::class);
    }

    public function enregistrePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enregistre_par');
    }

    /** La période chevauche-t-elle l'intervalle [$debut, $fin] ? */
    public function chevauche(Carbon $debut, Carbon $fin): bool
    {
        return $this->periode_debut->lte($fin)
            && ($this->periode_fin === null || $this->periode_fin->gte($debut));
    }
}
