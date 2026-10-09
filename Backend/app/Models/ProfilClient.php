<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProfilClient extends Model
{
    protected $table = 'profils_clients';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'date_naissance',
        'nationalite',
        'preferences',
        'langue_preferee',
        'points_fidelite',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
            'points_fidelite' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function adresses(): HasMany
    {
        return $this->hasMany(AdresseClient::class, 'profil_client_id');
    }

    public function methodesPaiement(): HasMany
    {
        return $this->hasMany(MethodePaiement::class, 'profil_client_id');
    }
}
