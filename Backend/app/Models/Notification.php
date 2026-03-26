<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $table = 'notifications';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'type_notification',
        'titre',
        'contenu',
        'lien',
        'lu',
        'canal',
        'reservation_id',
        'date_envoi',
        'date_lecture',
    ];

    protected function casts(): array
    {
        return [
            'lu' => 'boolean',
            'date_envoi' => 'datetime',
            'date_lecture' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    // Scopes
    public function scopeNonLu($query)
    {
        return $query->where('lu', false);
    }

    public function scopeInApp($query)
    {
        return $query->where('canal', 'in_app');
    }
}
