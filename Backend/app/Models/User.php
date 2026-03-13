<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    const CREATED_AT = 'date_inscription';
    const UPDATED_AT = 'updated_at';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password_hash',
        'telephone',
        'avatar_url',
        'email_verified',
        'two_factor_enabled',
        'two_factor_secret',
        'derniere_connexion',
        'date_inscription',
        'updated_at',
        'est_actif',
        'devise_preferee',
        'langue_preferee',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password_hash',
        'two_factor_secret',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'est_actif' => 'boolean',
            'derniere_connexion' => 'datetime',
            'date_inscription' => 'datetime',
            'updated_at' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }

    /**
     * Get the password for the user.
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    // ─── Relations ───────────────────────────────────────

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['id', 'assigned_by', 'assigned_at', 'expires_at', 'est_actif']);
    }

    public function authProviders(): HasMany
    {
        return $this->hasMany(AuthProvider::class);
    }

    public function assignedRoles(): HasMany
    {
        return $this->hasMany(UserRole::class, 'assigned_by');
    }

    public function profilClient(): HasOne
    {
        return $this->hasOne(ProfilClient::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'client_id');
    }

    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class);
    }

    public function hotelsFavoris(): BelongsToMany
    {
        return $this->belongsToMany(Hotel::class, 'favoris');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function notificationsNonLues(): HasMany
    {
        return $this->hasMany(Notification::class)->where('lu', false);
    }

    public function messagesEnvoyes(): HasMany
    {
        return $this->hasMany(Message::class, 'expediteur_id');
    }

    public function messagesRecus(): HasMany
    {
        return $this->hasMany(Message::class, 'destinataire_id');
    }

    public function hotelAdmins(): HasMany
    {
        return $this->hasMany(HotelAdmin::class);
    }

    public function logsAdmin(): HasMany
    {
        return $this->hasMany(LogAdmin::class, 'admin_id');
    }

    // ─── Helpers ─────────────────────────────────────────

    public function hasRole(string $code): bool
    {
        return $this->roles
            ->where('pivot.est_actif', true)
            ->contains('code', $code);
    }

    public function hasAnyRole(array $codes): bool
    {
        return $this->roles
            ->where('pivot.est_actif', true)
            ->whereIn('code', $codes)
            ->isNotEmpty();
    }

    public function hasMinLevel(int $level): bool
    {
        $min = $this->roles->where('pivot.est_actif', true)->min('niveau');

        return $min !== null && $min <= $level;
    }

    public function topRole(): ?Role
    {
        return $this->roles
            ->where('pivot.est_actif', true)
            ->sortByDesc('niveau')
            ->first();
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->prenom} {$this->nom}";
    }

    public function unreadNotificationsCount(): int
    {
        return $this->notifications()->where('lu', false)->count();
    }
}
