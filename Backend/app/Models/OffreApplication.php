<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OffreApplication extends Model
{
    protected $table = 'offre_applications';
    public $timestamps = false;

    protected $fillable = [
        'avantage_id',
        'entite_type',
        'entite_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function avantage(): BelongsTo
    {
        return $this->belongsTo(AvantageOffre::class, 'avantage_id');
    }
}
