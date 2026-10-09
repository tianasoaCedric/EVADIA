# Swagger API - Liste des endpoints

## Accès Swagger UI

```
http://localhost:8000/api/documentation
```

---

## Endpoints disponibles

### Authentification

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/api/auth/register` | Non | Inscription d'un nouvel utilisateur |
| POST | `/api/auth/login` | Non | Connexion et obtention du token |
| GET | `/api/auth/me` | Oui | Profil de l'utilisateur connecté |
| POST | `/api/auth/logout` | Oui | Déconnexion (token courant) |
| POST | `/api/auth/logout-all` | Oui | Fermer toutes les sessions |

---

## Détail des endpoints

### POST `/api/auth/register`

Crée un nouveau compte utilisateur avec le rôle "clients" par défaut.

**Body (JSON) :**
```json
{
    "nom": "Dupont",
    "prenom": "Cedric",
    "email": "cedric@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "telephone": "+33612345678"
}
```

**Champs obligatoires :** nom, prenom, email, password, password_confirmation

**Champs optionnels :** telephone

**Réponse 201 :**
```json
{
    "user": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Cedric",
        "email": "cedric@example.com",
        "roles": [
            { "code": "clients", "nom": "Client", "niveau": 4 }
        ]
    },
    "token": "1|evadia_abc123...",
    "token_type": "Bearer"
}
```

**Erreurs possibles :**
- `422` : Validation échouée (email déjà pris, mot de passe trop court, etc.)
- `429` : Trop de tentatives (3 inscriptions/min par IP)

---

### POST `/api/auth/login`

Authentifie un utilisateur et retourne un token Bearer.

**Body (JSON) :**
```json
{
    "email": "cedric@test.com",
    "password": "password123"
}
```

**Réponse 200 :**
```json
{
    "user": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Cedric",
        "email": "cedric@test.com",
        "est_actif": true,
        "derniere_connexion": "2026-03-11T19:43:06.000000Z",
        "roles": [
            { "id": 4, "code": "clients", "nom": "Client", "niveau": 4 }
        ]
    },
    "token": "2|evadia_xyz789...",
    "token_type": "Bearer"
}
```

**Erreurs possibles :**
- `422` : "Les identifiants sont incorrects." ou "Ce compte est désactivé."
- `429` : Trop de tentatives (5/min par email+IP)

---

### GET `/api/auth/me`

Retourne les informations de l'utilisateur connecté avec ses rôles.

**Header requis :**
```
Authorization: Bearer {token}
```

**Réponse 200 :**
```json
{
    "user": {
        "id": 1,
        "nom": "Dupont",
        "prenom": "Cedric",
        "email": "cedric@test.com",
        "telephone": "+33612345678",
        "avatar_url": null,
        "email_verified": false,
        "two_factor_enabled": false,
        "est_actif": true,
        "devise_preferee": "EUR",
        "derniere_connexion": "2026-03-11T19:43:06.000000Z",
        "date_inscription": "2026-03-11T19:42:50.000000Z",
        "roles": [
            {
                "id": 4,
                "code": "clients",
                "nom": "Client",
                "niveau": 4,
                "pivot": {
                    "user_id": 1,
                    "role_id": 4,
                    "est_actif": true,
                    "assigned_at": "2026-03-11 19:42:50"
                }
            }
        ]
    }
}
```

**Erreurs possibles :**
- `401` : Non authentifié (token manquant ou invalide)

---

### POST `/api/auth/logout`

Révoque le token courant. L'utilisateur est déconnecté de cette session uniquement.

**Header requis :**
```
Authorization: Bearer {token}
```

**Réponse 200 :**
```json
{
    "message": "Déconnexion réussie."
}
```

**Erreurs possibles :**
- `401` : Non authentifié

---

### POST `/api/auth/logout-all`

Révoque tous les tokens de l'utilisateur. Déconnecte toutes les sessions (mobile, web, etc.).

**Header requis :**
```
Authorization: Bearer {token}
```

**Réponse 200 :**
```json
{
    "message": "Toutes les sessions ont été fermées."
}
```

**Erreurs possibles :**
- `401` : Non authentifié

---

## Comment tester dans Swagger UI

1. Ouvrir `http://localhost:8000/api/documentation`
2. Exécuter **POST /api/auth/login** avec email et mot de passe
3. Copier le `token` de la réponse
4. Cliquer sur le bouton **Authorize** (cadenas en haut à droite)
5. Coller le token dans le champ (sans le mot "Bearer", Swagger l'ajoute automatiquement)
6. Cliquer **Authorize** puis **Close**
7. Les endpoints protégés sont maintenant accessibles

---

## Schéma d'authentification

```
Type     : HTTP Bearer
Format   : Sanctum Token
Header   : Authorization: Bearer {token}
Expiration : 120 minutes (configurable via SANCTUM_TOKEN_TTL)
Préfixe  : evadia_
```

---

## Régénérer la documentation

Après modification des annotations dans les controllers :

```bash
php artisan l5-swagger:generate
```

La documentation est auto-générée à partir des annotations PHP `#[OA\...]` dans les fichiers :
- `app/Http/Controllers/Controller.php` (info générale + sécurité)
- `app/Http/Controllers/Api/Auth/LoginController.php`
- `app/Http/Controllers/Api/Auth/RegisterController.php`
