<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '2.0.0',
    title: 'EVADIA API',
    description: 'API complète de la plateforme de gestion hôtelière EVADIA. Comprend l\'authentification, la gestion admin, le back-office hôtel et les endpoints client.',
    contact: new OA\Contact(name: 'EVADIA', email: 'contact@evadia.com')
)]
#[OA\Server(url: 'http://localhost:8000', description: 'Serveur local')]
#[OA\Tag(name: 'Authentification', description: 'Inscription, connexion, déconnexion et profil')]
#[OA\Tag(name: 'Admin - Hôtels', description: 'Gestion CRUD des hôtels (admin EVADIA)')]
#[OA\Tag(name: 'Admin - Utilisateurs', description: 'Gestion des utilisateurs (admin EVADIA)')]
#[OA\Tag(name: 'Admin - Abonnements', description: 'Gestion des abonnements hôteliers (admin EVADIA)')]
#[OA\Tag(name: 'Admin - Offres', description: 'Gestion des offres et promotions (admin EVADIA)')]
#[OA\Tag(name: 'Admin - Messagerie', description: 'Messagerie admin EVADIA')]
#[OA\Tag(name: 'Admin - Dashboard', description: 'Statistiques plateforme (admin EVADIA)')]
#[OA\Tag(name: 'Hôtel - Dashboard', description: 'Statistiques de l\'hôtel')]
#[OA\Tag(name: 'Hôtel - Chambres', description: 'Gestion des chambres/propriétés')]
#[OA\Tag(name: 'Hôtel - Réservations', description: 'Gestion des réservations')]
#[OA\Tag(name: 'Hôtel - Messagerie', description: 'Messagerie hôtel')]
#[OA\Tag(name: 'Hôtel - Paiements', description: 'Consultation des paiements')]
#[OA\Tag(name: 'Hôtel - Calendrier', description: 'Disponibilités et tarifs')]
#[OA\Tag(name: 'Hôtel - Offres', description: 'Offres et promotions de l\'hôtel')]
#[OA\Tag(name: 'Client - Hôtels', description: 'Recherche et consultation d\'hôtels')]
#[OA\Tag(name: 'Client - Réservations', description: 'Réservations du client')]
#[OA\Tag(name: 'Client - Favoris', description: 'Hôtels favoris')]
#[OA\Tag(name: 'Client - Avis', description: 'Avis et notes')]
#[OA\Tag(name: 'Client - Profil', description: 'Profil et préférences client')]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'Sanctum Token',
    description: 'Token obtenu via /api/auth/login ou /api/auth/register'
)]
abstract class Controller
{
    //
}
