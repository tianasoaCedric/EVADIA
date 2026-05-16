<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class VilleDecouverte extends Model
{
    protected $table = 'villes_decouverte';

    protected $fillable = [
        'nom',
        'slug',
        'image',
        'ordre',
        'actif',
        'created_by',
    ];

    protected $casts = [
        'actif' => 'boolean',
        'ordre' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $ville) {
            if (empty($ville->slug)) {
                $ville->slug = Str::slug($ville->nom);
            }
        });

        static::updating(function (self $ville) {
            if ($ville->isDirty('nom') && ! $ville->isDirty('slug')) {
                $ville->slug = Str::slug($ville->nom);
            }
        });
    }

    public function lieux(): HasMany
    {
        return $this->hasMany(LieuDecouverte::class, 'ville_id')->orderBy('ordre');
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
