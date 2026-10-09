<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdresseClient extends Model
{
    protected $table = 'adresses_clients';
    public $timestamps = false;

    protected $fillable = [
        'profil_client_id',
        'type_adresse',
        'adresse_ligne1',
        'adresse_ligne2',
        'code_postal',
        'ville',
        'pays',
        'est_defaut',
    ];

    protected function casts(): array
    {
        return ['est_defaut' => 'boolean'];
    }

    public function profilClient(): BelongsTo
    {
        return $this->belongsTo(ProfilClient::class, 'profil_client_id');
    }
}
