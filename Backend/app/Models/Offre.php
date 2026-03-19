<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Offre extends Model
{
    use HasFactory;

    protected $table = 'offres';
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'titre',
        'description',
        'date_debut',
        'date_fin',
        'code_promo',
        'statut',
        'created_at',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function avantages(): HasMany
    {
        return $this->hasMany(AvantageOffre::class, 'offre_id');
    }

    public function utilisations(): HasManyThrough
    {
        return $this->hasManyThrough(OffreUtilisation::class, AvantageOffre::class, 'offre_id', 'avantage_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('statut', 'active')
            ->where('date_debut', '<=', now())
            ->where('date_fin', '>=', now());
    }

    public function scopeEnCours($query)
    {
        return $query->where('date_debut', '<=', now())->where('date_fin', '>=', now());
    }

    public function scopeAVenir($query)
    {
        return $query->where('date_debut', '>', now());
    }

    public function scopeTerminee($query)
    {
        return $query->where('date_fin', '<', now());
    }
}
