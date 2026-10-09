<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MethodePaiement extends Model
{
    protected $table = 'methodes_paiement';
    public $timestamps = false;

    protected $fillable = [
        'profil_client_id',
        'type_paiement',
        'token_paiement',
        'derniers_4_chiffres',
        'date_expiration',
        'titulaire',
        'devise_par_defaut',
        'est_defaut',
        'date_ajout',
    ];

    protected $hidden = ['token_paiement'];

    protected function casts(): array
    {
        return [
            'est_defaut' => 'boolean',
            'date_ajout' => 'datetime',
        ];
    }

    public function profilClient(): BelongsTo
    {
        return $this->belongsTo(ProfilClient::class, 'profil_client_id');
    }
}
