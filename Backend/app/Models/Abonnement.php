<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Abonnement extends Model
{
    protected $table = 'abonnements';
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'type_abonnement',
        'date_debut',
        'date_fin',
        'prix_mensuel',
        'devise',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'prix_mensuel' => 'decimal:2',
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

    // Scopes
    public function scopeActif($query)
    {
        return $query->where(fn($q) => $q->whereNull('date_fin')->orWhere('date_fin', '>=', now()));
    }

    public function scopeExpire($query)
    {
        return $query->where('date_fin', '<', now());
    }

    public function scopeExpirantBientot($query, int $jours = 30)
    {
        return $query->whereBetween('date_fin', [now(), now()->addDays($jours)]);
    }
}
