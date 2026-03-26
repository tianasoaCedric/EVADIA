<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    #[OA\Get(
        path: '/api/admin/dashboard',
        summary: 'Statistiques de la plateforme',
        description: 'Retourne les statistiques globales : hôtels, utilisateurs, réservations, revenus.',
        tags: ['Admin - Dashboard'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Statistiques récupérées',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'total_hotels', type: 'integer', example: 42),
                        new OA\Property(property: 'total_users', type: 'integer', example: 1250),
                        new OA\Property(property: 'total_reservations', type: 'integer', example: 3400),
                        new OA\Property(property: 'reservations_ce_mois', type: 'integer', example: 120),
                        new OA\Property(property: 'revenus_ce_mois', type: 'number', format: 'float', example: 45000.50),
                        new OA\Property(property: 'hotels_actifs', type: 'integer', example: 38),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Non autorisé'),
        ]
    )]
    public function index(): JsonResponse
    {
        $now = now();

        return response()->json([
            'total_hotels' => Hotel::count(),
            'total_users' => User::count(),
            'total_reservations' => Reservation::count(),
            'reservations_ce_mois' => Reservation::whereMonth('date_reservation', $now->month)
                ->whereYear('date_reservation', $now->year)->count(),
            'revenus_ce_mois' => Reservation::whereMonth('date_reservation', $now->month)
                ->whereYear('date_reservation', $now->year)
                ->where('statut', '!=', 'annulee')
                ->sum('prix_total'),
            'hotels_actifs' => Hotel::whereHas('currentStatut', fn($q) => $q->where('statut', 'actif'))->count(),
        ]);
    }
}
