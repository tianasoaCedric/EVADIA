<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    protected $table = 'photos';
    public $timestamps = false;

    protected $fillable = [
        'propriete_id',
        'url_photo',
        'legende',
        'ordre',
        'est_principale',
        'uploaded_by',
        'date_upload',
    ];

    protected function casts(): array
    {
        return [
            'est_principale' => 'boolean',
            'ordre' => 'integer',
            'date_upload' => 'datetime',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
