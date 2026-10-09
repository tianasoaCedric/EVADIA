<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $table = 'messages';
    public $timestamps = false;

    public const TYPE_TEXTE = 'texte';
    public const TYPE_SYSTEME = 'systeme';
    public const TYPE_CHOIX_PAIEMENT = 'choix_paiement';

    protected $fillable = [
        'expediteur_id',
        'destinataire_id',
        'reservation_id',
        'type',
        'sujet',
        'contenu',
        'metadata',
        'lu',
        'date_envoi',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'lu' => 'boolean',
            'date_envoi' => 'datetime',
        ];
    }

    public function expediteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expediteur_id');
    }

    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
