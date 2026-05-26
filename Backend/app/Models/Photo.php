<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    protected $table = 'photos';
    public $timestamps = false;

    protected $fillable = [
        'entite_type',
        'entite_id',
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

    /**
     * Return the full public URL of the photo.
     * Handles both stored paths and already-full URLs.
     */
    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->url_photo, 'http')) {
            // Already a full URL (legacy data) — swap to CloudFront if needed
            $cfUrl = rtrim(config('filesystems.disks.s3.url', ''), '/');
            if ($cfUrl && !str_starts_with($this->url_photo, $cfUrl)) {
                $path = parse_url($this->url_photo, PHP_URL_PATH);
                return $cfUrl . $path;
            }
            return $this->url_photo;
        }

        $base = rtrim(config('filesystems.disks.s3.url', ''), '/');
        if ($base) {
            return $base . '/' . ltrim($this->url_photo, '/');
        }

        // Fallback to Storage URL (uses AWS_URL if set, else bucket URL)
        return \Illuminate\Support\Facades\Storage::disk('s3')->url($this->url_photo);
    }

    // ─── Scopes ────────────────────────────────────────

    public function scopeForHotel(Builder $query, int $hotelId): Builder
    {
        return $query->where('entite_type', 'hotel')->where('entite_id', $hotelId);
    }

    public function scopeForOffre(Builder $query, int $offreId): Builder
    {
        return $query->where('entite_type', 'offre')->where('entite_id', $offreId);
    }

    public function scopeForPropriete(Builder $query, int $proprieteId): Builder
    {
        return $query->where('entite_type', 'propriete')->where('entite_id', $proprieteId);
    }

    // ─── Relations ─────────────────────────────────────

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
