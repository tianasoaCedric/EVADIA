<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Equipement extends Model
{
    protected $table = 'equipements';
    public $timestamps = false;

    protected $fillable = ['nom', 'icone', 'categorie', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function proprietes(): BelongsToMany
    {
        return $this->belongsToMany(Propriete::class, 'propriete_equipements')
            ->withPivot('quantite');
    }
}
