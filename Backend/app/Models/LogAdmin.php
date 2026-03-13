<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogAdmin extends Model
{
    protected $table = 'logs_admin';
    public $timestamps = false;

    protected $fillable = [
        'admin_id',
        'action',
        'details',
        'ip_address',
        'user_agent',
        'date_action',
    ];

    protected function casts(): array
    {
        return ['date_action' => 'datetime'];
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
