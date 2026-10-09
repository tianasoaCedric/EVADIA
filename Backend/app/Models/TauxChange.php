<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TauxChange extends Model
{
    protected $table = 'taux_change';
    public $timestamps = false;

    protected $fillable = [
        'devise_source_id',
        'devise_cible_id',
        'taux',
        'date_effective',
        'source',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'taux' => 'decimal:4',
            'date_effective' => 'date',
            'created_at' => 'datetime',
        ];
    }

    public function deviseSource(): BelongsTo
    {
        return $this->belongsTo(Devise::class, 'devise_source_id');
    }

    public function deviseCible(): BelongsTo
    {
        return $this->belongsTo(Devise::class, 'devise_cible_id');
    }
}
