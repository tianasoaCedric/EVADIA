<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    protected $table = 'services';
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
        'nom',
        'description',
        'type_service',
        'tarif',
        'devise',
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'tarif' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }
}
