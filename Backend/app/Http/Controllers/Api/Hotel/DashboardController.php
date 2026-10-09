<?php

namespace App\Http\Controllers\Api\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class DashboardController extends Controller
{
    use BelongsToHotel;

    #[OA\Get(
        path: '/api/hotel/dashboard',
        summary: 'Statistiques de l\'hôtel',
        description: 'Retourne les statistiques du tableau de bord : réservations du jour, taux d\'occupation, revenus mensuels.',
        tags: ['Hôtel - Dashboard'],
        security: [['bearerAuth' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Statistiques de l\'hôtel',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'hotel', type: 'object', properties: [
                            new OA\Property(property: 'id', type: 'integer', example: 1),
                            new OA\Property(property: 'nom', type: 'string', example: 'Hôtel Renaissance'),
                        ]),
                        new OA\Property(property: 'total_chambres', type: 'integer', example: 45),
                        new OA\Property(property: 'reservations_aujourdhui', type: 'integer', example: 8),
                        new OA\Property(property: 'reservations_ce_mois', type: 'integer', example: 120),
                        new OA\Property(property: 'revenus_ce_mois', type: 'number', format: 'float', example: 15200.00),
                        new OA\Property(property: 'taux_occupation', type: 'number', format: 'float', example: 72.5),
                        new OA\Property(property: 'avis_moyen', type: 'number', format: 'float', example: 4.3),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Non authentifié'),
            new OA\Response(response: 403, description: 'Aucun hôtel associé'),
        ]
    )]
    public function index(): JsonResponse
    {
        $hotel = $this->getHotel();
        $proprieteIds = $hotel->proprietes()->pluck('id');
        $now = now();

        $reservationsCeMois = Reservation::whereIn('propriete_id', $proprieteIds)
            ->whereMonth('date_reservation', $now->month)
            ->whereYear('date_reservation', $now->year);

        $totalChambres = $hotel->proprietes()->count();
        $occupeesAujourdhui = Reservation::whereIn('propriete_id', $proprieteIds)
            ->where('date_debut', '<=', $now->toDateString())
            ->where('date_fin', '>=', $now->toDateString())
            ->where('statut', 'acceptee')
            ->count();

        return response()->json([
            'hotel' => ['id' => $hotel->id, 'nom' => $hotel->nom],
            'total_chambres' => $totalChambres,
            'reservations_aujourdhui' => Reservation::whereIn('propriete_id', $proprieteIds)
                ->whereDate('date_debut', $now->toDateString())->count(),
            'reservations_ce_mois' => (clone $reservationsCeMois)->count(),
            'revenus_ce_mois' => (clone $reservationsCeMois)->where('statut', '!=', 'annulee')->sum('prix_total'),
            'taux_occupation' => $totalChambres > 0
                ? round(($occupeesAujourdhui / $totalChambres) * 100, 1)
                : 0,
            'avis_moyen' => round($hotel->proprietes()->withAvg('avis', 'note')->get()->avg('avis_avg_note') ?? 0, 1),
        ]);
    }
}
