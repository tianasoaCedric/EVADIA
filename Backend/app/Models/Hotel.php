<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Cache;

class Hotel extends Model
{
    use HasFactory;

    const CREATED_AT = 'date_creation';

    protected static function booted(): void
    {
        // Vide les résultats de recherche en cache quand un hôtel change
        $flush = fn() => static::flushSearchCache();

        static::saved($flush);
        static::deleted($flush);
    }

    public static function flushSearchCache(): void
    {
        $redis  = Cache::getRedis();
        $prefix = config('cache.prefix') . ':search:';
        $cursor = '0';

        do {
            [$cursor, $keys] = $redis->scan($cursor, 'MATCH', $prefix . '*', 'COUNT', 100);
            if (!empty($keys)) {
                $redis->del($keys);
            }
        } while ($cursor !== '0');
    }
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'nom',
        'description',
        'email_contact',
        'telephone',
        'site_web',
        'etoiles',
        'note_moyenne',
        'nb_avis',
        'devise_principale',
        'date_creation',
        'updated_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'etoiles' => 'integer',
            'note_moyenne' => 'decimal:2',
            'nb_avis' => 'integer',
            'date_creation' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // --- Relations ---

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function adresse(): HasOne
    {
        return $this->hasOne(Adresse::class);
    }

    public function types(): BelongsToMany
    {
        return $this->belongsToMany(TypesHotel::class, 'hotel_types', 'hotel_id', 'type_hotel_id');
    }

    public function statuts(): HasMany
    {
        return $this->hasMany(HotelStatut::class);
    }

    public function currentStatut(): HasOne
    {
        return $this->hasOne(HotelStatut::class)->whereNull('date_fin');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class, 'entite_id')
            ->where('entite_type', 'hotel');
    }

    public function offres(): HasMany
    {
        return $this->hasMany(Offre::class);
    }

    public function abonnement(): HasOne
    {
        return $this->hasOne(Abonnement::class)->where(function ($q) {
            $q->whereNull('date_fin')->orWhere('date_fin', '>=', now());
        });
    }

    public function abonnements(): HasMany
    {
        return $this->hasMany(Abonnement::class);
    }

    public function proprietes(): HasMany
    {
        return $this->hasMany(Propriete::class);
    }

    public function admins(): HasMany
    {
        return $this->hasMany(HotelAdmin::class);
    }

    public function destinations(): BelongsToMany
    {
        return $this->belongsToMany(Destination::class, 'hotel_destinations');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class);
    }

    // --- Scopes ---

    public function scopeActif($query)
    {
        return $query->whereHas('currentStatut', fn($q) => $q->where('statut', 'actif'));
    }
}
