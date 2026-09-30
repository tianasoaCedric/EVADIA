<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Abonnement extends Model
{
    protected $table = 'abonnements';
    public $timestamps = false;

    const STATUT_ACTIF = 'actif';
    const STATUT_RETARD = 'retard';
    const STATUT_SUSPENDU = 'suspendu';
    const STATUT_PAUSE = 'pause';
    const STATUTS = [self::STATUT_ACTIF, self::STATUT_RETARD, self::STATUT_SUSPENDU, self::STATUT_PAUSE];

    /** Raison posée sur le statut de l'hôtel pendant une pause, seule réactivée à la reprise. */
    const RAISON_PAUSE = 'Pause abonnement';

    /** Jours de retard tolérés après l'échéance avant la suspension automatique. */
    const DELAI_GRACE_JOURS = 7;

    /** Raison posée sur le statut de l'hôtel, pour ne réactiver que ces suspensions-là. */
    const RAISON_IMPAYE = 'Abonnement impayé';

    /** Même défaut que la colonne, pour qu'un abonnement tout juste créé l'ait en mémoire. */
    protected $attributes = [
        'statut' => self::STATUT_ACTIF,
    ];

    protected $fillable = [
        'hotel_id',
        'type_abonnement',
        'date_debut',
        'date_fin',
        'prix_mensuel',
        'devise',
        'statut',
        'rappels_envoyes',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'prix_mensuel' => 'decimal:2',
            'rappels_envoyes' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function historique(): HasMany
    {
        return $this->hasMany(AbonnementHistorique::class)->orderByDesc('created_at');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(AbonnementPaiement::class)->orderByDesc('periode_debut');
    }

    public function pauses(): HasMany
    {
        return $this->hasMany(AbonnementPause::class)->orderByDesc('date_debut');
    }

    /** Pause planifiée ou en cours, s'il y en a une. */
    public function pauseActive(): ?AbonnementPause
    {
        return $this->pauses()->active()->first();
    }

    // ── Scopes ──────────────────────────────────────────────

    public function scopeActif($query)
    {
        return $query->where('statut', self::STATUT_ACTIF)
            ->where(fn($q) => $q->whereNull('date_fin')->orWhere('date_fin', '>=', now()));
    }

    public function scopeExpire($query)
    {
        return $query->where('date_fin', '<', now());
    }

    public function scopeExpirantBientot($query, int $jours = 30)
    {
        return $query->where('statut', self::STATUT_ACTIF)
            ->whereBetween('date_fin', [now(), now()->addDays($jours)]);
    }

    public function scopeEnRetard($query)
    {
        return $query->where('statut', self::STATUT_RETARD);
    }

    public function scopeSuspendu($query)
    {
        return $query->where('statut', self::STATUT_SUSPENDU);
    }

    // ── Helpers ─────────────────────────────────────────────

    public function estActif(): bool
    {
        return $this->statut === self::STATUT_ACTIF
            && ($this->date_fin === null || $this->date_fin->isFuture() || $this->date_fin->isToday());
    }

    public function joursAvantExpiration(): ?int
    {
        if (!$this->date_fin) {
            return null;
        }
        return (int) now()->startOfDay()->diffInDays($this->date_fin->startOfDay(), false);
    }

    /**
     * Un rappel est lié à une échéance précise : après un paiement (nouvelle
     * date de fin), les rappels du cycle suivant repartent de zéro.
     */
    public function marquerRappelEnvoye(string $type): void
    {
        $rappels = $this->rappels_envoyes ?? [];
        $rappels[$type] = $this->date_fin?->toDateString();
        $this->update(['rappels_envoyes' => $rappels]);
    }

    public function rappelDejaEnvoye(string $type): bool
    {
        $rappels = $this->rappels_envoyes ?? [];
        return isset($rappels[$type]) && $rappels[$type] === $this->date_fin?->toDateString();
    }

    /** Date à laquelle l'hôtel sera suspendu s'il ne paie pas. */
    public function dateSuspensionPrevue(): ?\Illuminate\Support\Carbon
    {
        return $this->date_fin?->copy()->addDays(1 + self::DELAI_GRACE_JOURS);
    }
}
