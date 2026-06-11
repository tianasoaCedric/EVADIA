# Guide Docker — Evadia

---

## Nouveau sur le projet ? Commence ici

### 1. Installer les prérequis

**WSL2** (Windows uniquement) — ouvrir PowerShell en administrateur :
```powershell
wsl --install
```
Redémarrer le PC après l'installation.

**Docker Desktop** — télécharger sur [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
→ Cocher "Use WSL2" pendant l'installation.

**Git** — si pas déjà installé : [git-scm.com](https://git-scm.com/)

---

### 2. Cloner le projet

```powershell
git clone <url-du-repo> EVADIA
cd EVADIA
```

---

### 3. Créer le fichier `.env.docker`

Ce fichier n'est **pas dans le repo** (gitignore). Créer un fichier `.env.docker` à la racine du projet avec ce contenu :

```env
# Application
APP_NAME=Evadia
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost
APP_KEY=base64:M5ISqBNgQvO/I7lsD8R682wZ4B8ZRcAZ/pTMqkowidk=

# Base de données
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=evadia
DB_USERNAME=postgres
DB_PASSWORD=1234

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_CLIENT=predis

# Cache / Sessions / Queue
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# WebSocket Reverb
REVERB_APP_ID=evadia
REVERB_APP_KEY=CHANGE_ME_REVERB_KEY
REVERB_APP_SECRET=CHANGE_ME_REVERB_SECRET
REVERB_HOST=reverb
REVERB_PORT=6001
REVERB_SCHEME=http
REVERB_SCALING_ENABLED=true

# Logs
LOG_CHANNEL=stderr
LOG_LEVEL=error
```

---

### 4. Premier lancement (build complet)

```powershell
docker compose up --build
```

> Durée : **10-15 minutes** la première fois (compilation Swoole). Les suivants seront rapides.

Laisser ce terminal ouvert et voir les logs défiler. Quand tout est `Started`, passer à l'étape suivante.

---

### 5. Migrations + Seeder (une seule fois)

Ouvrir **un deuxième terminal** dans le dossier du projet :

```powershell
docker compose exec api php artisan config:clear
docker compose exec api php artisan migrate --force
docker compose exec api php artisan db:seed --force
docker compose exec api php artisan config:cache
docker compose exec api php artisan route:cache
```

---

### 6. Accès

| URL | Service |
|---|---|
| `http://localhost` | Frontend Next.js |
| `http://localhost/admin/login` | Backoffice Admin |
| `http://localhost/hotel/login` | Backoffice Hôtel |
| `http://localhost/api/` | API Laravel |

**Compte admin par défaut :** `admin@evadia.com` / `Evadia2026!`

---

### Lancements suivants

```powershell
# Démarrer en arrière-plan
docker compose up -d

# Arrêter
docker compose down
```

---

---

## Commandes du quotidien

### Démarrage

```powershell
# Premier lancement (build complet)
docker compose up --build

# Lancement normal
docker compose up

# Lancement en arrière-plan
docker compose up -d

# Arrêt
docker compose down
```

---

### État des containers

```powershell
# Voir si tout tourne
docker compose ps

# Logs en temps réel (tous les services)
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f reverb
docker compose logs -f queue
```

---

### Base de données

```powershell
# Lancer les migrations
docker compose exec api php artisan migrate --force

# Rollback de la dernière migration
docker compose exec api php artisan migrate:rollback

# Voir l'état des migrations
docker compose exec api php artisan migrate:status

# Lancer les seeders
docker compose exec api php artisan db:seed --force

# Accéder à PostgreSQL directement
docker compose exec postgres psql -U postgres -d evadia

# Faire un dump de la base
docker compose exec postgres pg_dump -U postgres evadia > backup.sql

# Restaurer un dump (Linux/Mac)
cat backup.sql | docker compose exec -T postgres psql -U postgres -d evadia
```

---

### Laravel (API)

```powershell
# Vider tous les caches
docker compose exec api php artisan cache:clear
docker compose exec api php artisan config:clear
docker compose exec api php artisan route:clear
docker compose exec api php artisan view:clear

# Recacher (après modification de .env.docker)
docker compose exec api php artisan config:cache
docker compose exec api php artisan route:cache
docker compose exec api php artisan view:cache

# Shell interactif dans le container
docker compose exec api bash

# Console Laravel interactive
docker compose exec api php artisan tinker
```

---

### Rebuild

```powershell
# Après une modification du code backend (routes, controllers...)
docker compose build api
docker compose up -d api

# Rebuilder sans cache Docker (si problème persistant)
docker compose build --no-cache
docker compose up
```

> **Important** : toute modification du code PHP nécessite un rebuild de l'image `api`.
> Le `docker compose cp` peut copier un fichier sans rebuild pour un test rapide,
> mais le rebuild reste nécessaire pour que ce soit permanent.

---

### Volumes (données persistantes)

```powershell
# Voir les volumes
docker volume ls
```

| Volume | Contenu |
|---|---|
| `evadia_postgres_data` | Base de données PostgreSQL |
| `evadia_redis_data` | Cache Redis |
| `evadia_storage_data` | Fichiers uploadés |

```powershell
# Supprimer TOUTES les données (irréversible)
docker compose down -v
```

---

## Fichiers importants

| Fichier | Rôle |
|---|---|
| `docker-compose.yml` | Orchestration de tous les services |
| `.env.docker` | Variables d'environnement (à créer, non versionné) |
| `Backend/Dockerfile` | Image Laravel + Swoole |
| `frontend/Dockerfile` | Image Next.js standalone |
| `nginx/nginx.conf` | Configuration reverse proxy |

---

## Problèmes fréquents

### "port 80 already in use"
Un autre service utilise le port 80. L'arrêter ou changer le port dans `docker-compose.yml` :
```yaml
ports:
  - "8080:80"  # accéder via http://localhost:8080
```

### Migrations échouent
```powershell
docker compose exec api php artisan config:clear
docker compose exec api php artisan migrate --force
docker compose exec api php artisan config:cache
```

### 404 sur /admin/login après rebuild
Le fichier `routes/web.php` n'est peut-être pas à jour dans l'image. Rebuilder :
```powershell
docker compose build api
docker compose up -d api
```

### Container qui redémarre en boucle
```powershell
docker compose logs nom_du_service
```

### Tout réinitialiser proprement (repart de zéro)
```powershell
docker compose down -v --remove-orphans
docker compose up --build
# Puis relancer les migrations + seeders
```
