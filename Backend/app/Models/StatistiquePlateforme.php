<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatistiquePlateforme extends Model
{
    protected $table = 'statistiques_plateforme';
    public $timestamps = false;

    protected $fillable = [
        'date_stat',
        'nb_nouveaux_clients',
        'nb_nouveaux_hotels',
        'nb_reservations',
        'ca_total',
        'commission_totale',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'date_stat' => 'date',
            'ca_total' => 'decimal:2',
            'commission_totale' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }
}
