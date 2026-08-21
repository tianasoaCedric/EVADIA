# EVADIA

Plateforme de réservation d'hôtels : API Laravel, site web Next.js, app mobile Expo/React Native, backoffice hôtel/admin (Blade).

## Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (avec Docker Compose)
- Git

## 1. Cloner le projet

```bash
git clone <url-du-repo> evadia
cd evadia
```

## 2. Fichiers d'environnement

Trois fichiers `.env` contiennent des clés sensibles et ne sont **pas** versionnés dans git — il faut les créer manuellement. Demande-les à un membre de l'équipe déjà en place (ils contiennent des secrets réels : base de données, S3, mail, Google OAuth) plutôt que de les régénérer de zéro.

| Fichier | Rôle |
|---|---|
| `.env.docker` (racine) | Config du backend Laravel utilisée par Docker Compose |
| `Backend/.env` | Config Laravel utilisée hors Docker (CLI Artisan locale, IDE) |
| `frontend/.env.local` | Config du site Next.js |

Si tu démarres un environnement de dev tout neuf sans les vraies clés (S3, mail, Google), copie `Backend/.env.example` vers `.env.docker` à la racine et ajuste :

```bash
cp Backend/.env.example .env.docker
```

Puis complète au minimum dans `.env.docker` :
- `APP_KEY` — généré à l'étape 4 ci-dessous, laisse vide pour l'instant
- `DB_CONNECTION=pgsql`, `DB_DATABASE=evadia`, `DB_USERNAME=postgres`, `DB_PASSWORD=1234` (valeurs par défaut du `docker-compose.yml`)
- `MOBILE_API_KEY` — une chaîne aléatoire de ton choix (sert à authentifier l'app mobile auprès de nginx)
- `REVERB_APP_KEY` / `REVERB_APP_SECRET` / `REVERB_APP_ID` — valeurs de ton choix, doivent juste être cohérentes entre le backend et les apps qui s'y connectent

Pour `frontend/.env.local`, un minimum viable :
```
NEXT_PUBLIC_API_BASE_URL=http://localhost/api
DEFAULT_LOCALE=fr
```

Sans les vraies clés AWS/mail/Google, l'upload de fichiers, l'envoi d'e-mails et la connexion Google ne fonctionneront pas, mais le reste de l'application (réservations, messagerie, etc.) tourne normalement.

## 3. Lancer la stack Docker

Depuis la racine du projet :

```bash
docker compose up -d --build
```

Ça démarre : nginx (reverse proxy), l'API Laravel (Octane), un worker de queue, le WebSocket Reverb, le site Next.js, PostgreSQL, PgBouncer et Redis.

Vérifie que tout tourne :

```bash
docker compose ps
```

Tous les services doivent afficher `Up` (ou `Up (healthy)` pour postgres/redis).

## 4. Générer la clé applicative Laravel (première installation uniquement)

```bash
docker compose exec api php artisan key:generate
```

## 5. Appliquer les migrations

```bash
docker compose exec api php artisan migrate
```

Si l'environnement Docker est en `APP_ENV=production` (à vérifier dans `.env.docker`), Laravel demandera une confirmation explicite :

```bash
docker compose exec api php artisan migrate --force
```

## 6. Peupler les données de base (seeders)

Les migrations créent uniquement la structure des tables (schéma) — la base reste vide sans cette étape. Le seeder principal crée les rôles utilisateurs, un compte admin par défaut, les types d'hôtels, destinations, villes, équipements et plans d'abonnement :

```bash
docker compose exec api php artisan db:seed
```

Avec `--force` si l'environnement est en `production`, comme pour les migrations.

Ça crée notamment un compte administrateur EVADIA (`admin@evadia.com` / `Evadia2026!` — à changer en production) permettant d'accéder au backoffice admin. Ce seeder ne crée en revanche **ni hôtel, ni chambre, ni offre, ni réservation** — ces données doivent être créées manuellement via le backoffice ou par un autre canal (dump de base fourni par l'équipe, par exemple).

## 7. Accéder à l'application

| Service | URL |
|---|---|
| Site web (client) | http://localhost |
| API | http://localhost/api |
| Backoffice hôtel | http://localhost/hotel-admin |
| Backoffice admin EVADIA | http://localhost/admin |

## 8. App mobile (Expo)

L'app mobile n'est pas conteneurisée — elle tourne sur ta machine et se connecte à l'API via le réseau local.

```bash
cd mobile
npm install
npx expo start
```

Dans `mobile/src/lib/api.ts`, `API_BASE_URL` doit pointer vers l'adresse IP locale de la machine qui fait tourner Docker (pas `localhost`, injoignable depuis un téléphone/émulateur) :
- Émulateur Android : `http://10.0.2.2:8000`
- Appareil physique sur le même Wi-Fi : `http://<IP-locale-du-PC>:8000`

## Commandes utiles

```bash
# Voir les logs d'un service
docker compose logs -f api

# Redémarrer un service après une modification de code backend
docker compose build api queue
docker compose up -d api queue
docker compose restart nginx   # nécessaire après un rebuild pour rafraîchir le DNS interne

# Arrêter la stack
docker compose down

# Arrêter et supprimer les données (bases de données incluses)
docker compose down -v
```

## Dépannage rapide

- **502 Bad Gateway sur les routes `/api/*`** : nginx a mis en cache l'ancienne IP d'un conteneur redémarré. `docker compose restart nginx` résout le problème.
- **`REVERB_APP_KEY variable is not set` (warning au démarrage)** : sans conséquence si tu n'utilises pas la messagerie temps réel ; sinon exporte la variable avant `docker compose up`/`build` : `export REVERB_APP_KEY=<ta-cle>` (Linux/macOS) ou `$env:REVERB_APP_KEY="<ta-cle>"` (PowerShell).
- **Erreur de connexion à la base au démarrage de l'API** : postgres met quelques secondes à devenir `healthy` ; relance `docker compose up -d` si l'API a démarré avant que la base soit prête.
