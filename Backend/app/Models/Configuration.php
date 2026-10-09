<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Configuration extends Model
{
    protected $table = 'configuration';
    public $timestamps = false;

    protected $fillable = [
        'cle_config',
        'valeur_config',
        'description',
        'updated_by',
        'updated_at',
    ];

    protected function casts(): array
    {
        return ['updated_at' => 'datetime'];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
