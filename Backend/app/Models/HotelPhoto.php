<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HotelPhoto extends Model
{
    protected $table = 'hotel_photos';
    public $timestamps = false;

    protected $fillable = [
        'hotel_id',
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

    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
