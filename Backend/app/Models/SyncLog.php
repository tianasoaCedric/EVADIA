<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SyncLog extends Model
{
    protected $table = 'sync_logs';
    public $timestamps = false;

    protected $fillable = [
        'source',
        'date_sync',
        'statut',
        'nb_taux_importes',
        'message',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'date_sync' => 'datetime',
            'created_at' => 'datetime',
        ];
    }
}
