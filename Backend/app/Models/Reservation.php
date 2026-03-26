<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{
    use HasFactory;

    protected $table = 'reservations';
    public $timestamps = false;

    protected $fillable = [
        'code_reservation',
        'client_id',
        'propriete_id',
        'date_debut',
        'date_fin',
        'nb_adultes',
        'nb_enfants',
        'nb_bebes',
        'prix_total',
        'devise_prix_total',
        'statut',
        'date_reservation',
        'demande_speciale',
        'annulee_par',
        'raison_annulation',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'prix_total' => 'decimal:2',
            'nb_adultes' => 'integer',
            'nb_enfants' => 'integer',
            'nb_bebes' => 'integer',
            'date_reservation' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function annuleePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'annulee_par');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    public function avis(): HasOne
    {
        return $this->hasOne(Avis::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(ReservationService::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Generate unique reservation code
    public static function generateCode(): string
    {
        do {
            $code = 'EV-' . strtoupper(substr(uniqid(), -8));
        } while (static::where('code_reservation', $code)->exists());

        return $code;
    }
}
