<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class AbonnementPause extends Model
{
    protected $table = 'abonnement_pauses';
    public $timestamps = false;

    const STATUT_PLANIFIEE = 'planifiee';
    const STATUT_EN_COURS = 'en_cours';
    const STATUT_TERMINEE = 'terminee';
    const STATUT_ANNULEE = 'annulee';

    /** Pauses qui retirent (ou vont retirer) l'hôtel du site. */
    const STATUTS_ACTIVES = [self::STATUT_PLANIFIEE, self::STATUT_EN_COURS];

    protected $attributes = [
        'statut' => self::STATUT_PLANIFIEE,
    ];

    protected $fillable = [
        'abonnement_id',
        'hotel_id',
        'date_debut',
        'date_reprise',
        'statut',
        'raison',
        'jours_reportes',
        'rappel_reprise_envoye',
        'created_by',
        'ended_by',
        'ended_at',
    ];

    protected function casts(): array
    {
        return [
            'date_debut'            => 'date',
            'date_reprise'          => 'date',
            'jours_reportes'        => 'integer',
            'rappel_reprise_envoye' => 'boolean',
            'created_at'            => 'datetime',
            'ended_at'              => 'datetime',
        ];
    }

    public function abonnement(): BelongsTo
    {
        return $this->belongsTo(Abonnement::class);
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('statut', self::STATUTS_ACTIVES);
    }

    /** Durée en jours (du début à la reprise prévue). */
    public function duree(): int
    {
        return (int) $this->date_debut->diffInDays($this->date_reprise);
    }

    /** La pause couvre-t-elle au moins un jour de [$debut, $fin] ? (jour de reprise exclu) */
    public function chevauche(Carbon $debut, Carbon $fin): bool
    {
        return $this->statut !== self::STATUT_ANNULEE
            && $this->date_debut->lte($fin)
            && $this->date_reprise->gt($debut);
    }
}
