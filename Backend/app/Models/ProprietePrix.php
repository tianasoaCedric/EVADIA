<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProprietePrix extends Model
{
    protected $table = 'propriete_prix';
    public $timestamps = false;

    protected $fillable = [
        'propriete_id',
        'prix',
        'devise',
        'date_debut',
        'date_fin',
        'raison',
        'changed_by',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'prix' => 'decimal:2',
            'date_debut' => 'datetime',
            'date_fin' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
