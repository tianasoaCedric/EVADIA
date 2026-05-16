<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class LieuDecouverte extends Model
{
    protected $table = 'lieux_decouverte';

    protected $fillable = [
        'ville_id',
        'nom',
        'slug',
        'description',
        'emplacement',
        'images',
        'position_image',
        'ordre',
        'actif',
        'created_by',
    ];

    protected $casts = [
        'images' => 'array',
        'actif' => 'boolean',
        'ordre' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $lieu) {
            if (empty($lieu->slug)) {
                $lieu->slug = Str::slug($lieu->nom);
            }
        });

        static::updating(function (self $lieu) {
            if ($lieu->isDirty('nom') && ! $lieu->isDirty('slug')) {
                $lieu->slug = Str::slug($lieu->nom);
            }
        });
    }

    public function ville(): BelongsTo
    {
        return $this->belongsTo(VilleDecouverte::class, 'ville_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActif(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('actif', true);
    }
}
