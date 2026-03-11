<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    const CREATED_AT = 'date_inscription';
    const UPDATED_AT = 'updated_at';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
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
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'two_factor_secret',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
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
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * The roles that belong to the user.
     */
    public function roles(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot(['id', 'assigned_by', 'assigned_at', 'expires_at', 'est_actif']);
    }

    /**
     * Get the authentication providers for the user.
     */
    public function authProviders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AuthProvider::class);
    }

    /**
     * Get the roles that this user has assigned to others.
     */
    public function assignedRoles(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserRole::class, 'assigned_by');
    }

    public function hasRole(string $code): bool
    {
        return $this->roles
            ->where('pivot.est_actif', true)
            ->contains('code', $code);
    }

    public function hasMinLevel(int $level): bool
    {
        $min = $this->roles->where('pivot.est_actif', true)->min('niveau');

        return $min !== null && $min <= $level;
    }
}
