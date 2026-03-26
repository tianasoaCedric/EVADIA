<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Langue extends Model
{
    protected $table = 'langues';
    public $timestamps = false;

    protected $fillable = [
        'code',
        'nom',
        'drapeau',
        'est_active',
        'est_defaut',
        'ordre_affichage',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'est_active' => 'boolean',
            'est_defaut' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    public function traductions(): HasMany
    {
        return $this->hasMany(Traduction::class);
    }
}
