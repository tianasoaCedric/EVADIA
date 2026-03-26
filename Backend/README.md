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

### 2. Installer les dépendances PHP

```bash
composer install
```

### 3. Installer les dépendances JavaScript

```bash
npm install
```

### 4. Configuration de l'environnement

```bash
cp .env.example .env
php artisan key:generate
```

Modifier le fichier `.env` selon votre environnement :

```env
# Application
APP_NAME=EVADIA
APP_URL=http://localhost:8000

# Base de données PostgreSQL
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=evadia
DB_USERNAME=postgres
DB_PASSWORD=votre_mot_de_passe

# Redis (optionnel)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Stockage S3
AWS_ACCESS_KEY_ID=votre_cle
AWS_SECRET_ACCESS_KEY=votre_secret
AWS_DEFAULT_REGION=eu-west-3
AWS_BUCKET=evadia-uploads

# Email (SMTP pour production)
MAIL_MAILER=smtp
MAIL_HOST=smtp.exemple.com
MAIL_PORT=587
MAIL_USERNAME=noreply@evadia.com
MAIL_PASSWORD=votre_mot_de_passe
MAIL_FROM_ADDRESS=noreply@evadia.com
MAIL_FROM_NAME=EVADIA

# WebSocket (Reverb)
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=evadia-local
REVERB_APP_KEY=evadia-reverb-key
REVERB_APP_SECRET=evadia-reverb-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

### 5. Créer la base de données et lancer les migrations

```bash
php artisan migrate
```

### 6. Exécuter les seeders (données initiales)

```bash
php artisan db:seed
```

Cela crée :
- Les 5 rôles système (`super_admin`, `admin_evadia`, `admin_hotel`, `gestionnaire_hotel`, `client`)
- Un compte admin par défaut : **admin@evadia.com** / **Evadia2026!**

### 7. Compiler les assets frontend

```bash
# Développement (avec hot-reload)
npm run dev

# Production
npm run build
```

### 8. Lancer le serveur

```bash
# Terminal 1 : Serveur Laravel
php artisan serve

# Terminal 2 : Serveur WebSocket (pour la messagerie temps réel)
php artisan reverb:start

# Terminal 3 : Queue worker (pour les notifications, emails)
php artisan queue:work

# Terminal 4 : Vite dev server (développement uniquement)
npm run dev
```

L'application est accessible sur : **http://localhost:8000**

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

#### 2.4 Gestion des Abonnements

| URL | Description |
|-----|-------------|
| `GET /admin/subscriptions` | Liste des abonnements hôteliers |
| `GET /admin/subscriptions/create` | Créer un nouvel abonnement |
| `POST /admin/subscriptions` | Enregistrer l'abonnement |
| `GET /admin/subscriptions/{sub}` | Détail d'un abonnement |
| `GET /admin/subscriptions/{sub}/edit` | Modifier un abonnement |
| `PUT /admin/subscriptions/{sub}` | Mise à jour |
| `DELETE /admin/subscriptions/{sub}` | Supprimer |

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

### Particularités du schéma

- **Photos polymorphiques** : La table `photos` utilise `entite_type` + `entite_id` au lieu de clés étrangères séparées. Cela permet de stocker les photos d'hôtels (`entite_type = 'hotel'`) et de chambres (`entite_type = 'propriete'`) dans la même table.
- **Colonnes personnalisées** : `date_inscription` au lieu de `created_at`, `password_hash` au lieu de `password` (override via `getAuthPassword()` dans le modèle User).
- **Soft-desactivation** : Les admins hôtels sont désactivés via `date_fin` dans `hotel_admins` plutôt que supprimés.

---

## WebSocket (Messagerie temps réel)

La messagerie utilise **Laravel Reverb** comme serveur WebSocket.

### Configuration

Les variables d'environnement sont dans `.env` :
```env
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=evadia-local
REVERB_APP_KEY=evadia-reverb-key
REVERB_APP_SECRET=evadia-reverb-secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

### Fonctionnement

1. Un utilisateur envoie un message via le formulaire
2. Le contrôleur crée le `Message` en base et diffuse un événement `NewMessageSent`
3. L'événement est envoyé sur le canal privé `messages.{destinataire_id}`
4. Le navigateur du destinataire reçoit l'événement via Laravel Echo et affiche le message sans rechargement

### Lancer le serveur WebSocket

```bash
php artisan reverb:start
```

En production avec SSL :
```bash
php artisan reverb:start --host=0.0.0.0 --port=443
```

---

## Commandes utiles

```bash
# Lancer les tests
php artisan test

# Vider les caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Voir toutes les routes
php artisan route:list

# Regénérer la doc Swagger
php artisan l5-swagger:generate

# Lancer les migrations en production
php artisan migrate --force

# Rollback dernière migration
php artisan migrate:rollback

# Créer un lien symbolique pour le storage
php artisan storage:link

# Optimiser pour la production
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## Déploiement en production

```bash
# 1. Installer les dépendances (sans dev)
composer install --no-dev --optimize-autoloader
npm install && npm run build

# 2. Configurer l'environnement
cp .env.example .env
# Modifier .env avec les valeurs de production
php artisan key:generate

# 3. Migrations
php artisan migrate --force

# 4. Optimiser
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 5. Lancer les services
php artisan reverb:start --host=0.0.0.0 &
php artisan queue:work --daemon &
```

### Services requis en production

| Service | Usage |
|---------|-------|
| **Nginx / Apache** | Serveur web (pointer vers `/public`) |
| **PHP-FPM 8.2+** | Exécution PHP |
| **PostgreSQL** | Base de données |
| **Redis** | Cache, sessions, queues |
| **Supervisor** | Gérer `queue:work` et `reverb:start` en daemon |
| **S3 / MinIO** | Stockage des photos |
| **SMTP** | Envoi d'emails (réinitialisation mot de passe, notifications) |

---

## Licence

Projet propriétaire EVADIA. Tous droits réservés.
