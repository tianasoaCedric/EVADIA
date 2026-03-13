<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Propriete extends Model
{
    use HasFactory;

    protected $table = 'proprietes';
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'nom',
        'description',
        'type_propriete',
        'capacite',
        'nb_chambres',
        'nb_lits',
        'nb_salles_bain',
        'superficie',
        'created_by',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'capacite' => 'integer',
            'nb_chambres' => 'integer',
            'nb_lits' => 'integer',
            'nb_salles_bain' => 'integer',
            'superficie' => 'integer',
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

    public function prix(): HasMany
    {
        return $this->hasMany(ProprietePrix::class);
    }

    public function currentPrix(): HasOne
    {
        return $this->hasOne(ProprietePrix::class)->whereNull('date_fin')->latest('date_debut');
    }

    public function statuts(): HasMany
    {
        return $this->hasMany(ProprieteStatut::class);
    }

    public function currentStatut(): HasOne
    {
        return $this->hasOne(ProprieteStatut::class)->whereNull('date_fin');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class)->orderBy('ordre');
    }

    public function equipements(): BelongsToMany
    {
        return $this->belongsToMany(Equipement::class, 'propriete_equipements')
            ->withPivot('quantite');
    }

    public function disponibilites(): HasMany
    {
        return $this->hasMany(Disponibilite::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function politiquesAnnulation(): HasMany
    {
        return $this->hasMany(PolitiqueAnnulation::class);
    }

    public function avis(): HasMany
    {
        return $this->hasMany(Avis::class);
    }
}
