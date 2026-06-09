# EVADIA - Plateforme de Gestion Hoteliere

Plateforme complète de gestion hôtelière avec back-office admin EVADIA, back-office hôtel, et API REST.

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Backend | Laravel 12 (PHP 8.2+) |
| Frontend | Blade + Tailwind CSS 4 + Alpine.js |
| Base de données | PostgreSQL (recommandé) / MySQL / SQLite |
| Authentification | Laravel Sanctum (sessions + tokens API) |
| WebSocket | Laravel Reverb (temps réel) |
| Stockage fichiers | Amazon S3 |
| Cache / Sessions | Redis (recommandé) ou database |
| Build frontend | Vite 7 |
| Documentation API | Swagger (L5-Swagger) |

---

## Installation

### Prérequis

- **PHP 8.2+** avec les extensions : `pdo`, `pgsql` (ou `mysql`), `redis`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `gd`
- **Composer 2.x**
- **Node.js 18+** et **npm**
- **PostgreSQL 15+** (ou MySQL 8+)
- **Redis** (optionnel mais recommandé pour cache/sessions/queues)

### 1. Cloner le projet

```bash
git clone <url-du-repo> evadia
cd evadia/Backend
```

> Telecharge le code source du projet et se place dans le dossier `Backend` qui contient l'application Laravel.

### 2. Installer les dependances PHP

```bash
composer install
```

> Installe toutes les librairies PHP necessaires au projet (Laravel, Sanctum, L5-Swagger, etc.).
> Les packages sont definis dans `composer.json` et installes dans le dossier `vendor/`.
> Si Composer n'est pas installe : [getcomposer.org](https://getcomposer.org/download/)

### 3. Installer les dependances JavaScript

```bash
npm install
```

> Installe les packages front-end (Tailwind CSS, Alpine.js, Vite, Laravel Echo, etc.).
> Les packages sont definis dans `package.json` et installes dans le dossier `node_modules/`.
> Necessite Node.js 18+ : [nodejs.org](https://nodejs.org/)

### 4. Configuration de l'environnement

```bash
cp .env.example .env
php artisan key:generate
```

> - `cp .env.example .env` : Copie le fichier de configuration modele. Le fichier `.env` contient toutes les variables sensibles (mots de passe, cles API) et n'est **jamais** commit dans Git.
> - `php artisan key:generate` : Genere une cle de chiffrement unique (`APP_KEY`) utilisee par Laravel pour securiser les sessions, cookies et donnees chiffrees. **Obligatoire** avant le premier lancement.

Ouvrir le fichier `.env` et modifier les valeurs selon votre environnement :

```env
# ── Application ──────────────────────────────────────
APP_NAME=EVADIA                    # Nom affiche dans les emails et le titre
APP_URL=http://localhost:8000      # URL de base (adapter en production)
APP_ENV=local                      # local = dev, production = prod
APP_DEBUG=true                     # true = affiche les erreurs detaillees (desactiver en production)

# ── Base de donnees ──────────────────────────────────
# PostgreSQL est recommande (le projet utilise ilike pour la recherche)
DB_CONNECTION=pgsql                # Driver : pgsql, mysql ou sqlite
DB_HOST=127.0.0.1                  # Adresse du serveur de base de donnees
DB_PORT=5432                       # Port par defaut : 5432 (PostgreSQL), 3306 (MySQL)
DB_DATABASE=evadia                 # Nom de la base (a creer manuellement avant)
DB_USERNAME=postgres               # Utilisateur de la base de donnees
DB_PASSWORD=votre_mot_de_passe     # Mot de passe de la base de donnees

# ── Queue / Jobs ─────────────────────────────────────
QUEUE_CONNECTION=sync              # sync = execution immediate (pas besoin de queue:work)
                                   # database = execution asynchrone (necessite php artisan queue:work)

# ── Cache et Sessions ────────────────────────────────
CACHE_STORE=file                   # file = stockage sur disque (suffisant en dev)
SESSION_DRIVER=file                # file, database ou redis

# ── Redis (optionnel) ────────────────────────────────
# Utile en production pour le cache, les sessions et les queues
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# ── Stockage fichiers (S3) ───────────────────────────
# Necessaire uniquement si vous activez l'upload de photos
FILESYSTEM_DISK=local              # local = stockage sur disque, s3 = Amazon S3
AWS_ACCESS_KEY_ID=votre_cle
AWS_SECRET_ACCESS_KEY=votre_secret
AWS_DEFAULT_REGION=eu-west-3
AWS_BUCKET=evadia-uploads

# ── Email ────────────────────────────────────────────
# En dev : MAIL_MAILER=log (les emails sont ecrits dans storage/logs)
# En prod : configurer un serveur SMTP reel
MAIL_MAILER=log                    # log = pas d'envoi reel, smtp = envoi reel
MAIL_HOST=smtp.exemple.com
MAIL_PORT=587
MAIL_USERNAME=noreply@evadia.com
MAIL_PASSWORD=votre_mot_de_passe
MAIL_FROM_ADDRESS=noreply@evadia.com
MAIL_FROM_NAME=EVADIA

# ── WebSocket (Reverb) ──────────────────────────────
# Necessaire uniquement pour la messagerie en temps reel
BROADCAST_CONNECTION=log           # log = pas de websocket, reverb = temps reel actif
REVERB_APP_ID=evadia-local
REVERB_APP_KEY=evadia-reverb-key
REVERB_APP_SECRET=evadia-reverb-secret
REVERB_HOST=localhost
REVERB_PORT=6001                   # Port du client (navigateur)
REVERB_SERVER_PORT=6001            # Port du serveur WebSocket
REVERB_SCHEME=http                 # http en dev, https en production
```

### 5. Creer la base de donnees et lancer les migrations

Avant de lancer les migrations, creer la base de donnees manuellement :

```bash
# PostgreSQL
psql -U postgres -c "CREATE DATABASE evadia;"

# Ou avec MySQL
# mysql -u root -p -e "CREATE DATABASE evadia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Puis executer les migrations :

```bash
php artisan migrate
```

> Cette commande cree toutes les tables dans la base de donnees a partir des fichiers de migration situes dans `database/migrations/`.
> Chaque fichier de migration definit la structure d'une ou plusieurs tables (colonnes, index, cles etrangeres).
> En cas d'erreur, verifier que la base `evadia` existe et que les identifiants dans `.env` sont corrects.

### 6. Executer les seeders (donnees initiales)

```bash
php artisan db:seed
```

> Les seeders inserent les donnees necessaires au fonctionnement de l'application :
> - **5 roles systeme** : `super_admin` (niveau 100), `admin_evadia` (90), `admin_hotel` (50), `gestionnaire_hotel` (40), `client` (10)
> - **Un compte administrateur** : `admin@evadia.com` / `Evadia2026!`
>
> Les seeders se trouvent dans `database/seeders/`. Vous pouvez les modifier pour ajouter des donnees de test supplementaires.
> Pour re-executer un seeder specifique : `php artisan db:seed --class=RolesAndAdminSeeder`

### 7. Compiler les assets frontend

```bash
# Developpement (avec hot-reload : les changements CSS/JS sont appliques instantanement)
npm run dev

# Production (fichiers minifies et optimises dans public/build/)
npm run build
```

> - `npm run dev` : Lance le serveur Vite qui compile les assets a la volee. Utile pendant le developpement car les modifications sont appliquees sans rechargement.
> - `npm run build` : Genere les fichiers CSS/JS finaux dans `public/build/`. **Obligatoire** si vous n'utilisez pas `npm run dev` car sans le manifest Vite, Laravel ne peut pas charger les styles.
> - Si vous voyez l'erreur "Vite manifest not found", lancez `npm run build` ou `npm run dev`.

### 8. Lancer le serveur

```bash
# Terminal 1 : Serveur Laravel (obligatoire)
php artisan serve
```

> Demarre le serveur de developpement PHP sur `http://localhost:8000`.
> C'est le seul terminal obligatoire pour commencer a utiliser l'application.

```bash
# Terminal 2 : Vite dev server (recommande en developpement)
npm run dev
```

> Compile les assets CSS/JS en temps reel. Si vous preferez ne pas le lancer, executez `npm run build` une seule fois.

```bash
# Terminal 3 : Serveur WebSocket (optionnel - uniquement pour la messagerie temps reel)
php artisan reverb:start
```

> Demarre le serveur WebSocket sur le port 6001. Necessaire uniquement si `BROADCAST_CONNECTION=reverb` dans `.env`.
> Si le port est occupe, changez `REVERB_SERVER_PORT` dans `.env`.
> En dev, vous pouvez utiliser `BROADCAST_CONNECTION=log` pour desactiver le temps reel.

```bash
# Terminal 4 : Queue worker (optionnel - uniquement si QUEUE_CONNECTION=database)
php artisan queue:work
```

> Execute les jobs en arriere-plan (emails, notifications asynchrones).
> **Non necessaire** si `QUEUE_CONNECTION=sync` dans `.env` (les jobs sont executes immediatement).

L'application est accessible sur : **http://localhost:8000**

### Resume : configuration minimale pour demarrer

Pour un demarrage rapide en developpement, seules ces etapes sont necessaires :

```bash
composer install                  # Dependances PHP
npm install                       # Dependances JS
cp .env.example .env              # Fichier de configuration
php artisan key:generate          # Cle de chiffrement
# Configurer DB_* dans .env       # Connexion base de donnees
php artisan migrate               # Creer les tables
php artisan db:seed               # Donnees initiales
npm run build                     # Compiler les assets
php artisan serve                 # Lancer le serveur
```

> Avec `QUEUE_CONNECTION=sync` et `BROADCAST_CONNECTION=log`, un seul terminal suffit.

---

## Comptes par défaut

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | admin@evadia.com | Evadia2026! |

---

## Architecture des rôles

| Rôle | Niveau | Description |
|------|--------|-------------|
| `super_admin` | 100 | Accès total au système |
| `admin_evadia` | 90 | Gestion de la plateforme (hôtels, offres, utilisateurs) |
| `admin_hotel` | 50 | Gestion complète d'un hôtel spécifique |
| `gestionnaire_hotel` | 40 | Gestion opérationnelle d'un hôtel |
| `client` | 10 | Réservation et consultation |

---

## Pages et fonctionnalités

### 1. Authentification Admin EVADIA

| URL | Description |
|-----|-------------|
| `GET /` | Page de connexion admin EVADIA |
| `POST /` | Soumission du formulaire de connexion |
| `GET /register` | Inscription d'un nouveau compte |
| `POST /register` | Soumission de l'inscription |
| `GET /forgot-password` | Formulaire de mot de passe oublié |
| `POST /forgot-password` | Envoi du lien de réinitialisation par email |
| `GET /reset-password/{token}` | Formulaire de nouveau mot de passe |
| `POST /reset-password` | Enregistrement du nouveau mot de passe |
| `POST /logout` | Déconnexion |
| `GET /email/verify/{id}/{hash}` | Vérification d'email |

**Fonctionnalités :** Toggle afficher/masquer mot de passe sur tous les champs, validation email, protection CSRF.

---

### 2. Back-Office Admin EVADIA (`/admin`)

Accessible aux rôles : `super_admin`, `admin_evadia`

#### 2.1 Dashboard

| URL | Description |
|-----|-------------|
| `GET /admin/dashboard` | Tableau de bord avec statistiques globales |

Affiche : nombre d'hôtels, réservations, utilisateurs, revenus, graphiques.

#### 2.2 Gestion des Utilisateurs

| URL | Description |
|-----|-------------|
| `GET /admin/users` | Liste de tous les utilisateurs avec recherche et filtres |
| `GET /admin/users/{user}` | Détail d'un utilisateur (profil, réservations, activité) |
| `GET /admin/users/{user}/edit` | Formulaire de modification d'un utilisateur |
| `PUT /admin/users/{user}` | Mise à jour d'un utilisateur |
| `PATCH /admin/users/{user}/toggle-status` | Activer/désactiver un utilisateur |

#### 2.3 Gestion des Hôtels

| URL | Description |
|-----|-------------|
| `GET /admin/hotels` | Liste des hôtels avec statuts et recherche |
| `GET /admin/hotels/create` | Formulaire de création d'un hôtel |
| `POST /admin/hotels` | Enregistrer un nouvel hôtel |
| `GET /admin/hotels/{hotel}` | Détail complet d'un hôtel |
| `GET /admin/hotels/{hotel}/edit` | Formulaire de modification |
| `PUT /admin/hotels/{hotel}` | Mise à jour de l'hôtel |
| `DELETE /admin/hotels/{hotel}` | Supprimer un hôtel |
| `PATCH /admin/hotels/{hotel}/status` | Changer le statut (en_attente, actif, suspendu) |
| `POST /admin/hotels/{hotel}/photos` | Ajouter des photos (upload vers S3) |
| `DELETE /admin/hotels/{hotel}/photos/{photo}` | Supprimer une photo |

#### 2.4 Suivi des Abonnements

| URL | Description |
|-----|-------------|
| `GET /admin/subscriptions` | Tableau de suivi annuel : liste des hotels avec colonnes Jan-Dec |
| `GET /admin/subscriptions/create` | Creer un nouvel abonnement |
| `POST /admin/subscriptions` | Enregistrer l'abonnement |
| `GET /admin/subscriptions/{sub}` | Detail d'un abonnement |
| `GET /admin/subscriptions/{sub}/edit` | Modifier un abonnement |
| `PUT /admin/subscriptions/{sub}` | Mise a jour |

La page index affiche un tableau avec les hotels en lignes et les 12 mois en colonnes. Chaque cellule indique si l'hotel a un abonnement actif (vert) ou expire (rouge) pour ce mois. Filtres disponibles : recherche par nom d'hotel, selection de l'annee. Pagination par 10 hotels.

#### 2.5 Gestion des Offres

| URL | Description |
|-----|-------------|
| `GET /admin/offers` | Liste des offres et promotions |
| `GET /admin/offers/create` | Créer une offre |
| `POST /admin/offers` | Enregistrer l'offre |
| `GET /admin/offers/{offer}` | Détail d'une offre |
| `GET /admin/offers/{offer}/edit` | Modifier une offre |
| `PUT /admin/offers/{offer}` | Mise à jour |
| `DELETE /admin/offers/{offer}` | Supprimer |
| `PATCH /admin/offers/{offer}/toggle` | Activer/désactiver une offre |
| `GET /admin/offers/generate-promo-code` | Générer un code promo unique |

#### 2.6 Messagerie Admin

| URL | Description |
|-----|-------------|
| `GET /admin/messages` | Liste des conversations (inbox) |
| `GET /admin/messages/create` | Nouveau message |
| `POST /admin/messages` | Envoyer un message |
| `GET /admin/messages/conversation/{user}` | Conversation avec un utilisateur |
| `PATCH /admin/messages/{message}/read` | Marquer un message comme lu (AJAX) |

**Temps réel :** Les messages arrivent instantanément via WebSocket (Laravel Reverb + Echo). Pas besoin de rafraîchir la page.

---

### 3. Authentification Hôtel (`/hotel`)

| URL | Description |
|-----|-------------|
| `GET /hotel/login` | Page de connexion hôtel |
| `POST /hotel/login` | Soumission connexion |
| `POST /hotel/logout` | Déconnexion |
| `GET /hotel/forgot-password` | Mot de passe oublié |
| `POST /hotel/forgot-password` | Envoi du lien de réinitialisation |
| `GET /hotel/reset-password/{token}` | Nouveau mot de passe |
| `POST /hotel/reset-password` | Enregistrer le nouveau mot de passe |
| `GET /hotel/password/change` | Changement de mot de passe forcé (premier login) |
| `POST /hotel/password/change` | Enregistrer le changement |

**Note :** Le middleware `ForcePasswordChange` redirige les nouveaux comptes vers `/hotel/password/change` lors de leur première connexion.

---

### 4. Back-Office Hôtel (`/hotel`)

Accessible aux rôles : `admin_hotel`, `gestionnaire_hotel`

#### 4.1 Dashboard

| URL | Description |
|-----|-------------|
| `GET /hotel/dashboard` | Tableau de bord de l'hôtel : réservations du jour, taux d'occupation, revenus, dernières activités |

#### 4.2 Profil

| URL | Description |
|-----|-------------|
| `GET /hotel/profile` | Voir et modifier le profil personnel |
| `PUT /hotel/profile` | Mettre à jour les informations personnelles |
| `PUT /hotel/profile/password` | Changer le mot de passe |

Toggle afficher/masquer sur les 3 champs (mot de passe actuel, nouveau, confirmation).

#### 4.3 Contenu de l'Hôtel

| URL | Description |
|-----|-------------|
| `GET /hotel/content` | Page d'édition du contenu hôtel (description, étoiles, coordonnées) |
| `PUT /hotel/content` | Mettre à jour les informations de l'hôtel |
| `POST /hotel/content/photos` | Ajouter des photos (upload S3, max 5 Mo/photo) |
| `DELETE /hotel/content/photos/{photo}` | Supprimer une photo |
| `PATCH /hotel/content/photos/reorder` | Réordonner les photos (drag & drop) |
| `POST /hotel/content/services` | Ajouter un service (Wi-Fi, piscine, spa, etc.) |
| `PUT /hotel/content/services/{service}` | Modifier un service |
| `DELETE /hotel/content/services/{service}` | Supprimer un service |

**Photos :** Système polymorphique - les photos d'hôtel et de chambres sont stockées dans la même table `photos` avec `entite_type` (hotel/propriete) et `entite_id`.

#### 4.4 Gestion des Chambres

| URL | Description |
|-----|-------------|
| `GET /hotel/rooms` | Liste des chambres avec statuts et filtres |
| `GET /hotel/rooms/create` | Formulaire d'ajout de chambre |
| `POST /hotel/rooms` | Créer une chambre |
| `GET /hotel/rooms/{room}` | Détail d'une chambre |
| `GET /hotel/rooms/{room}/edit` | Modifier une chambre |
| `PUT /hotel/rooms/{room}` | Mettre à jour |
| `DELETE /hotel/rooms/{room}` | Supprimer |
| `PATCH /hotel/rooms/{propriete}/status` | Changer le statut (disponible, maintenance, etc.) |
| `POST /hotel/rooms/{propriete}/photos` | Ajouter des photos à la chambre |
| `DELETE /hotel/rooms/{propriete}/photos/{photo}` | Supprimer une photo |
| `PATCH /hotel/rooms/{propriete}/photos/reorder` | Réordonner les photos |

#### 4.5 Réservations

| URL | Description |
|-----|-------------|
| `GET /hotel/reservations` | Liste des réservations avec filtres (date, statut, chambre) |
| `GET /hotel/reservations/{reservation}` | Détail complet d'une réservation (client, paiement, dates) |
| `PATCH /hotel/reservations/{reservation}/status` | Changer le statut (confirmee, annulee, terminee, etc.) |

Les réservations sont automatiquement scopées à l'hôtel de l'utilisateur connecté.

#### 4.6 Calendrier de disponibilités

| URL | Description |
|-----|-------------|
| `GET /hotel/calendar` | Vue calendrier des disponibilités par chambre |
| `GET /hotel/calendar/data` | Données JSON du calendrier (requête AJAX) |
| `POST /hotel/calendar/disponibilite` | Mettre à jour la disponibilité d'une date |
| `POST /hotel/calendar/bulk` | Mise à jour en masse (plage de dates) |

Permet de gérer jour par jour la disponibilité et les tarifs de chaque chambre.

#### 4.7 Tarification

| URL | Description |
|-----|-------------|
| `GET /hotel/pricing` | Vue des tarifs par chambre |
| `POST /hotel/pricing/{propriete}/price` | Définir/modifier le prix d'une chambre |

#### 4.8 Offres et Promotions

| URL | Description |
|-----|-------------|
| `GET /hotel/offers` | Liste des offres de l'hôtel + offres EVADIA globales |
| `GET /hotel/offers/create` | Créer une offre spécifique à l'hôtel |
| `POST /hotel/offers` | Enregistrer l'offre |
| `GET /hotel/offers/{offer}/edit` | Modifier une offre |
| `PUT /hotel/offers/{offer}` | Mettre à jour |
| `PATCH /hotel/offers/{offre}/toggle` | Activer/désactiver une offre |

Les offres sont liées à l'hôtel via `hotel_id`. Les offres EVADIA (globales) sont visibles mais non modifiables.

#### 4.9 Messagerie

| URL | Description |
|-----|-------------|
| `GET /hotel/messages` | Boîte de réception (conversations avec les admins EVADIA) |
| `GET /hotel/messages/conversation/{user}` | Conversation avec un admin |
| `POST /hotel/messages` | Envoyer un nouveau message |
| `POST /hotel/messages/reply` | Répondre dans une conversation |
| `PATCH /hotel/messages/{message}/read` | Marquer comme lu (AJAX temps réel) |

**Temps réel :** Les messages apparaissent instantanément dans la conversation via WebSocket. Un événement `NewMessageSent` est diffusé sur le canal privé `messages.{userId}`.

#### 4.10 Paiements

| URL | Description |
|-----|-------------|
| `GET /hotel/payments` | Historique des paiements reçus avec filtres |
| `GET /hotel/payments/{paiement}` | Détail d'un paiement |
| `GET /hotel/payments/export` | Exporter les paiements (CSV) |

---

### 5. API REST (`/api`)

Documentation Swagger disponible sur : `GET /docs`

#### 5.1 Authentification API

| Méthode | URL | Description |
|---------|-----|-------------|
| `POST` | `/api/auth/register` | Inscription (throttled) |
| `POST` | `/api/auth/login` | Connexion, retourne un token Sanctum |
| `POST` | `/api/auth/logout` | Déconnexion (révoque le token actuel) |
| `POST` | `/api/auth/logout-all` | Révoquer tous les tokens |
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté |

**Header requis pour les routes protégées :**
```
Authorization: Bearer {votre-token}
```

#### 5.2 API Admin (niveau 2+)

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET` | `/api/admin/hotels` | Liste des hôtels |
| `POST` | `/api/admin/hotels` | Créer un hôtel |
| `GET` | `/api/admin/hotels/{hotel}` | Détail d'un hôtel |
| `PUT` | `/api/admin/hotels/{hotel}` | Modifier un hôtel |
| `DELETE` | `/api/admin/hotels/{hotel}` | Supprimer un hôtel |

---

## Structure de la base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `users` | Tous les utilisateurs (admins, hôteliers, clients) |
| `roles` / `user_roles` | Rôles et attributions |
| `hotels` | Informations des hôtels |
| `hotel_admins` | Liaison utilisateur-hôtel (avec `date_fin` pour désactivation) |
| `proprietes` | Chambres/propriétés des hôtels |
| `photos` | Photos polymorphiques (`entite_type`: hotel/propriete) |
| `reservations` | Réservations clients |
| `paiements` | Paiements liés aux réservations |
| `disponibilites` | Calendrier de disponibilité jour par jour |
| `propriete_prix` | Historique des tarifs |
| `offres` | Offres et promotions (globales ou par hôtel via `hotel_id`) |
| `messages` | Messages privés entre utilisateurs |
| `notifications` | Notifications in-app |
| `services` | Services des hôtels |
| `avis` | Avis et notes des clients |
| `abonnements` | Plans d'abonnement des hôtels |
| `destinations` | Destinations touristiques |
| `log_admin` | Journal des actions administratives |

### Particularites du schema

- **Photos** : La table `photos` utilise `propriete_id` pour lier les photos aux chambres. Le systeme de photos n'est pas encore actif en production (migration presente mais non utilisee).
- **Colonnes personnalisees** : La table `users` utilise `date_inscription` au lieu de `created_at` et `password_hash` au lieu de `password`. Le modele `User` surcharge `getAuthPassword()` pour que Laravel utilise `password_hash` pour l'authentification.
- **Soft-desactivation** : Les admins hotels sont desactives via `date_fin` dans `hotel_admins` plutot que supprimes. Cela permet de garder l'historique des assignations.
- **Recherche** : Le projet utilise `ilike` (PostgreSQL) pour les recherches insensibles a la casse. Si vous utilisez MySQL, remplacez par `like`.

---

## WebSocket (Messagerie temps réel)

La messagerie utilise **Laravel Reverb** comme serveur WebSocket.

### Configuration

Les variables d'environnement sont dans `.env` :
```env
BROADCAST_CONNECTION=reverb        # Activer le broadcast via Reverb
REVERB_APP_ID=evadia-local         # Identifiant de l'application Reverb
REVERB_APP_KEY=evadia-reverb-key   # Cle publique (utilisee cote client)
REVERB_APP_SECRET=evadia-reverb-secret  # Cle secrete (utilisee cote serveur)
REVERB_HOST=localhost              # Hote du serveur WebSocket
REVERB_PORT=6001                   # Port cote client (navigateur)
REVERB_SERVER_PORT=6001            # Port d'ecoute du serveur Reverb
REVERB_SCHEME=http                 # http en dev, https en production
```

> **Note :** En developpement, vous pouvez desactiver le temps reel avec `BROADCAST_CONNECTION=log`. La messagerie fonctionnera toujours mais les messages n'apparaitront qu'apres rechargement de la page.

### Fonctionnement

1. Un utilisateur envoie un message via le formulaire
2. Le controleur cree le `Message` en base et diffuse un evenement `NewMessageSent`
3. L'evenement est envoye sur le canal prive `messages.{destinataire_id}`
4. Le navigateur du destinataire recoit l'evenement via Laravel Echo et affiche le message sans rechargement

### Lancer le serveur WebSocket

```bash
php artisan reverb:start
```

> Demarre le serveur WebSocket sur le port defini dans `REVERB_SERVER_PORT`.
> Si le port est deja utilise par un autre processus, changez la valeur dans `.env`.

En production avec SSL :
```bash
php artisan reverb:start --host=0.0.0.0 --port=443
```

---

## Commandes utiles

### Tests

```bash
php artisan test                   # Lance tous les tests unitaires et fonctionnels
php artisan test --filter=HotelTest  # Lance un test specifique
```

### Cache

```bash
php artisan cache:clear            # Vide le cache applicatif (donnees en cache)
php artisan config:clear           # Vide le cache de configuration (apres modif .env)
php artisan route:clear            # Vide le cache des routes (apres modif routes/)
php artisan view:clear             # Vide le cache des vues Blade compilees
```

> **Quand utiliser ?** Apres avoir modifie `.env`, les routes, ou si vous avez un comportement inattendu, videz les caches concernes.

### Routes

```bash
php artisan route:list             # Affiche toutes les routes avec URL, methode, middleware
php artisan route:list --path=admin  # Filtrer par prefixe
```

### Documentation Swagger

```bash
php artisan l5-swagger:generate    # Regenere la doc API a partir des annotations PHP
```

> La documentation est ensuite accessible sur `http://localhost:8000/docs`

### Migrations

```bash
php artisan migrate                # Execute les nouvelles migrations
php artisan migrate --force        # Force en production (pas de confirmation)
php artisan migrate:rollback       # Annule la derniere migration
php artisan migrate:status         # Voir quelles migrations ont ete executees
```

### Stockage

```bash
php artisan storage:link           # Cree un lien symbolique public/storage -> storage/app/public
```

> Necessaire pour que les fichiers uploades dans `storage/app/public/` soient accessibles via URL.

### Optimisation production

```bash
php artisan optimize               # Cache config + routes + vues en une commande
php artisan config:cache           # Cache la configuration (ne plus modifier .env sans re-cacher)
php artisan route:cache            # Cache les routes (plus rapide au demarrage)
php artisan view:cache             # Pre-compile toutes les vues Blade
```

> En production, ces commandes accelerent le chargement de l'application. Ne pas utiliser `config:cache` en dev car les modifications de `.env` ne seront plus prises en compte sans `config:clear`.

---

## Deploiement en production

### Etape 1 : Installer les dependances

```bash
composer install --no-dev --optimize-autoloader
npm install && npm run build
```

> - `--no-dev` : N'installe pas les packages de developpement (phpunit, debugbar, etc.)
> - `--optimize-autoloader` : Genere un autoloader optimise pour de meilleures performances
> - `npm run build` : Compile les assets CSS/JS en fichiers minifies dans `public/build/`

### Etape 2 : Configurer l'environnement

```bash
cp .env.example .env
php artisan key:generate
```

> Modifier `.env` avec les valeurs de production :
> - `APP_ENV=production` et `APP_DEBUG=false` (ne jamais afficher les erreurs en prod)
> - `DB_*` : Identifiants de la base de donnees de production
> - `QUEUE_CONNECTION=database` ou `redis` (pour l'execution asynchrone)
> - `BROADCAST_CONNECTION=reverb` (si temps reel actif)
> - `MAIL_MAILER=smtp` avec un vrai serveur SMTP
> - `FILESYSTEM_DISK=s3` pour le stockage des photos

### Etape 3 : Migrations

```bash
php artisan migrate --force
```

> `--force` est necessaire en production car Laravel demande une confirmation par defaut. Cette commande cree/met a jour les tables sans toucher aux donnees existantes.

### Etape 4 : Optimiser

```bash
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> Ces commandes mettent en cache la configuration, les routes et les vues Blade compilees. L'application demarre plus vite car elle ne relit pas les fichiers a chaque requete.
> **Important :** Apres chaque deploiement, re-executez ces commandes pour prendre en compte les nouveaux fichiers.

### Etape 5 : Lancer les services

```bash
php artisan reverb:start --host=0.0.0.0 &
php artisan queue:work --daemon &
```

> - `reverb:start` : Serveur WebSocket pour la messagerie temps reel
> - `queue:work --daemon` : Traite les jobs en arriere-plan (emails, notifications)
> - En production, utilisez **Supervisor** pour garder ces processus actifs et les redemarrer automatiquement en cas de crash

### Services requis en production

| Service | Usage | Pourquoi |
|---------|-------|----------|
| **Nginx / Apache** | Serveur web | Sert les fichiers statiques et redirige les requetes vers PHP-FPM. Pointer le `root` vers le dossier `/public` |
| **PHP-FPM 8.2+** | Execution PHP | Traite les requetes Laravel. Configurer `max_children` selon la charge |
| **PostgreSQL** | Base de donnees | Stocke toutes les donnees. Configurer les backups automatiques |
| **Redis** | Cache, sessions, queues | Accelere les lectures frequentes et gere les files d'attente de jobs |
| **Supervisor** | Gestion de processus | Maintient `queue:work` et `reverb:start` actifs en permanence |
| **S3 / MinIO** | Stockage des photos | Stockage scalable pour les photos d'hotels et de chambres |
| **SMTP** | Envoi d'emails | Pour les reinitialisation de mot de passe et les notifications email |

---

## Licence

Projet propriétaire EVADIA. Tous droits réservés.
