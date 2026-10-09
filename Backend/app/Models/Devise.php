<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Devise extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'code',
        'nom',
        'symbole',
        'est_active',
        'source_principale',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'est_active' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function tauxSource(): HasMany
    {
        return $this->hasMany(TauxChange::class, 'devise_source_id');
    }

    public function tauxCible(): HasMany
    {
        return $this->hasMany(TauxChange::class, 'devise_cible_id');
    }
}
