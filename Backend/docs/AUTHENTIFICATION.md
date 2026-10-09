# Authentification EVADIA - Documentation

## Vue d'ensemble

EVADIA utilise **Laravel Sanctum** pour l'authentification API et **Redis** pour les sessions et le cache. Le principe : l'utilisateur envoie ses identifiants, reçoit un **token Bearer**, et l'utilise dans chaque requête pour prouver son identité.

---

## Comment ça marche (schéma simplifié)

```
┌──────────┐         ┌──────────────┐         ┌──────────┐         ┌───────────┐
│  Client   │────────>│  Laravel API │────────>│ PostgreSQL│         │   Redis   │
│ (browser) │<────────│  (Sanctum)   │<────────│ (users,  │         │ (sessions │
│           │  token  │              │  query   │  tokens) │         │  + cache) │
└──────────┘         └──────────────┘         └──────────┘         └───────────┘
```

---

## Parcours utilisateur

### 1. Inscription (`POST /api/auth/register`)

```
Utilisateur remplit le formulaire
        │
        ▼
Envoie : nom, prenom, email, password, password_confirmation
        │
        ▼
Laravel crée le user dans PostgreSQL (table "users")
        │
        ▼
Attribue automatiquement le rôle "clients" (table "user_roles")
        │
        ▼
Sanctum génère un token (stocké hashé dans "personal_access_tokens")
        │
        ▼
Retourne au client : { user, token, token_type: "Bearer" }
```

### 2. Connexion (`POST /api/auth/login`)

```
Utilisateur entre email + mot de passe
        │
        ▼
Laravel cherche le user par email dans PostgreSQL
        │
        ▼
Vérifie le mot de passe (bcrypt)
        │
        ▼
Vérifie que le compte est actif (est_actif = true)
        │
        ▼
Met à jour "derniere_connexion"
        │
        ▼
Sanctum génère un nouveau token
        │
        ▼
Retourne : { user, token, token_type: "Bearer" }
```

### 3. Accéder à une page protégée (`GET /api/auth/me`)

```
Client envoie la requête avec le header :
    Authorization: Bearer 2|evadia_xxxxxxxxxxxx
        │
        ▼
Middleware "auth:sanctum" intercepte la requête
        │
        ▼
Sanctum extrait le token, le hashe, le cherche dans "personal_access_tokens"
        │
        ▼
Vérifie que le token n'est pas expiré (120 minutes max)
        │
        ▼
Charge le user associé
        │
        ▼
La requête continue vers le controller → retourne les données
```

### 4. Déconnexion (`POST /api/auth/logout`)

```
Client envoie la requête avec son token Bearer
        │
        ▼
Sanctum identifie le token courant
        │
        ▼
Supprime le token de la table "personal_access_tokens"
        │
        ▼
Le token ne fonctionne plus → l'utilisateur est déconnecté
```

---

## Rôle de Redis

Redis est un serveur de stockage **en mémoire** (très rapide). On l'utilise pour deux choses :

### Sessions (`SESSION_DRIVER=redis`)
Au lieu de stocker les sessions web dans PostgreSQL (lent), elles sont dans Redis (rapide). Chaque session a un TTL (durée de vie) automatique.

### Cache (`CACHE_STORE=redis`)
Les données fréquemment lues (comme les lookups de tokens) sont mises en cache dans Redis au lieu de requêter la base à chaque fois.

### Organisation Redis
```
DB 0 → Données Redis par défaut
DB 1 → Cache applicatif
DB 2 → Sessions utilisateurs
```

Cette séparation en databases évite que les données se mélangent.

---

## Structure des fichiers

### Fichiers de configuration

| Fichier | Rôle |
|---------|------|
| `.env` | Variables d'environnement (Redis, BDD, durée token) |
| `config/auth.php` | Définit les guards d'authentification (api = sanctum) |
| `config/sanctum.php` | Config Sanctum : expiration token (120 min), préfixe (evadia_) |
| `config/database.php` | Connexions BDD + Redis (default, cache, sessions) |

### Fichiers d'authentification

| Fichier | Rôle |
|---------|------|
| `app/Http/Controllers/Api/Auth/LoginController.php` | Login, logout, logout-all, me |
| `app/Http/Controllers/Api/Auth/RegisterController.php` | Inscription |
| `app/Http/Middleware/CheckRole.php` | Vérifie le rôle par code (ex: `super_admin`) |
| `app/Http/Middleware/CheckRoleLevel.php` | Vérifie le rôle par niveau hiérarchique |

### Modèles

| Fichier | Rôle |
|---------|------|
| `app/Models/User.php` | Modèle utilisateur (trait HasApiTokens pour Sanctum) |
| `app/Models/Role.php` | Modèle rôle (code, nom, niveau) |
| `app/Models/UserRole.php` | Pivot user ↔ role (avec expiration, statut actif) |

### Routes

| Fichier | Rôle |
|---------|------|
| `routes/api.php` | Toutes les routes API (auth + routes protégées) |
| `routes/web.php` | Routes web (page login) |

### Vues

| Fichier | Rôle |
|---------|------|
| `resources/views/auth/login.blade.php` | Page de connexion (HTML/CSS/JS pur) |

### Migrations

| Fichier | Tables créées |
|---------|---------------|
| `migrations/0001_01_01_000000_create_users_table.php` | users, password_reset_tokens, sessions |
| `migrations/2026_03_10_230000_create_auth_and_roles_tables.php` | auth_providers, roles, user_roles |
| `migrations/2026_03_11_..._create_personal_access_tokens_table.php` | personal_access_tokens (Sanctum) |

---

## Les routes API

### Routes publiques (pas besoin de token)

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter |

### Routes protégées (token Bearer obligatoire)

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/auth/me` | Voir son profil + rôles |
| POST | `/api/auth/logout` | Se déconnecter (token courant) |
| POST | `/api/auth/logout-all` | Fermer toutes les sessions |

### Routes par rôle

| Middleware | Qui peut accéder | Préfixe URL |
|------------|-----------------|-------------|
| `level:2` | super_admin + admin_evadia | `/api/admin/...` |
| `level:3` | super_admin + admin_evadia + admin_hotel | `/api/hotel/...` |
| `role:super_admin` | super_admin uniquement | `/api/super/...` |

---

## Le système de rôles

4 rôles avec un système de **niveaux hiérarchiques** :

```
Niveau 1 : super_admin    → Accès total au système
Niveau 2 : admin_evadia   → Gestion de la plateforme
Niveau 3 : admin_hotel    → Gestion d'un hôtel
Niveau 4 : clients        → Utilisateur standard
```

Un niveau inférieur a **plus de pouvoir**. Le middleware `level:3` autorise les niveaux 1, 2 et 3 (mais pas 4).

---

## Comment utiliser le token dans le code frontend

### Après connexion, stocker le token :
```javascript
// La réponse du login contient le token
const data = await response.json();
localStorage.setItem('auth_token', data.token);
```

### Pour chaque requête protégée, envoyer le token :
```javascript
const token = localStorage.getItem('auth_token');

fetch('/api/auth/me', {
    headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
    }
});
```

### Pour se déconnecter :
```javascript
fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
    }
});
localStorage.removeItem('auth_token');
```

---

## Configuration .env importante

```env
# Base de données
DB_CONNECTION=pgsql
DB_DATABASE=evadia

# Redis
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Sessions stockées dans Redis (pas en BDD)
SESSION_DRIVER=redis
SESSION_ENCRYPT=true

# Cache dans Redis
CACHE_STORE=redis

# Token expire après 120 minutes
SANCTUM_TOKEN_TTL=120
```

---

## Rate Limiting (protection anti-brute force)

| Route | Limite |
|-------|--------|
| `/api/auth/login` | 5 tentatives / minute (par email + IP) |
| `/api/auth/register` | 3 inscriptions / minute (par IP) |

Configuré dans `app/Providers/AppServiceProvider.php`.

---

## Prérequis pour que tout fonctionne

1. **PostgreSQL** démarré sur le port 5432
2. **Redis** démarré sur le port 6379
3. Migrations exécutées : `php artisan migrate`
4. Seeders exécutés : `php artisan db:seed` (crée les 4 rôles)
5. Serveur Laravel : `php artisan serve`
