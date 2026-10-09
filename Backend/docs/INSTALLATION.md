# Installation - EVADIA Backend

## Prérequis système

| Outil | Version minimum | Vérifier |
|-------|----------------|----------|
| PHP | 8.2+ | `php -v` |
| Composer | 2.x | `composer -V` |
| PostgreSQL | 14+ | `psql --version` |
| Redis | 6+ | `redis-server --version` |
| Node.js | 18+ (optionnel) | `node -v` |

## Packages PHP installés

### Production

| Package | Version | Rôle |
|---------|---------|------|
| `laravel/framework` | ^12.0 | Framework principal |
| `laravel/sanctum` | ^4.3 | Authentification API (tokens Bearer) |
| `predis/predis` | ^3.4 | Client Redis pour PHP |
| `darkaonline/l5-swagger` | ^10.1 | Documentation Swagger UI |
| `laravel/tinker` | ^2.10.1 | Console interactive |

### Développement

| Package | Version | Rôle |
|---------|---------|------|
| `fakerphp/faker` | ^1.23 | Génération de données de test |
| `laravel/pail` | ^1.2.2 | Lecture des logs en temps réel |
| `laravel/pint` | ^1.24 | Formatage du code PHP |
| `laravel/sail` | ^1.41 | Environnement Docker |
| `mockery/mockery` | ^1.6 | Mocking pour les tests |
| `nunomaduro/collision` | ^8.6 | Meilleur affichage des erreurs |
| `phpunit/phpunit` | ^11.5.3 | Tests unitaires |

## Installation pas à pas

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd EVADIA/Backend
```

### 2. Installer les dépendances PHP

```bash
composer install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
php artisan key:generate
```

Modifier le fichier `.env` :

```env
# Base de données PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=evadia
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe

# Redis
REDIS_CLIENT=predis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Sessions et cache via Redis
SESSION_DRIVER=redis
SESSION_ENCRYPT=true
CACHE_STORE=redis

# Token Sanctum (expiration en minutes)
SANCTUM_TOKEN_TTL=120
```

### 4. Démarrer Redis

**Windows (installation native) :**
```bash
redis-server
```

**Docker :**
```bash
docker run --name redis -p 6379:6379 -d redis
```

**Linux/WSL :**
```bash
sudo service redis-server start
```

### 5. Créer la base de données

```sql
CREATE DATABASE evadia;
```

### 6. Exécuter les migrations et seeders

```bash
php artisan migrate
php artisan db:seed
```

Cela crée :
- Table `users`
- Table `roles` (avec 4 rôles : super_admin, admin_evadia, admin_hotel, clients)
- Table `user_roles`
- Table `auth_providers`
- Table `personal_access_tokens` (Sanctum)
- Table `sessions`
- Table `password_reset_tokens`
- Table `cache` et `cache_locks`

### 7. Générer la documentation Swagger

```bash
php artisan l5-swagger:generate
```

### 8. Démarrer le serveur

```bash
php artisan serve
```

## URLs disponibles

| URL | Description |
|-----|-------------|
| `http://localhost:8000` | Page d'accueil |
| `http://localhost:8000/login` | Page de connexion |
| `http://localhost:8000/docs` | Swagger UI (documentation API) |
| `http://localhost:8000/docs/json` | Spécification OpenAPI (JSON) |

## Vérification rapide

```bash
# Vérifier Redis
php artisan tinker --execute="echo Illuminate\Support\Facades\Redis::ping();"
# Doit afficher : PONG

# Vérifier les routes
php artisan route:list --path=api

# Tester l'inscription
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"nom":"Test","prenom":"User","email":"test@test.com","password":"password123","password_confirmation":"password123"}'
```

## Commandes utiles

```bash
php artisan migrate:fresh --seed    # Reset BDD + seeders
php artisan l5-swagger:generate     # Regénérer Swagger
php artisan config:clear            # Vider le cache config
php artisan route:list              # Lister toutes les routes
php artisan tinker                  # Console interactive
```
