<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'code', 'nom', 'label', 'description',
        'prix', 'devise', 'features',
        'badge_bg', 'badge_text', 'border',
        'est_actif', 'ordre',
    ];

    protected function casts(): array
    {
        return [
            'features'  => 'array',
            'prix'      => 'decimal:2',
            'est_actif' => 'boolean',
        ];
    }

    public function scopeActif($query)
    {
        return $query->where('est_actif', true)->orderBy('ordre');
    }
}
