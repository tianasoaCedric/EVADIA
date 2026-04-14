<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\JsonResponse;

class DestinationController extends Controller
{
    /**
     * Liste toutes les destinations avec le nombre d'hôtels actifs.
     * GET /api/destinations
     */
    public function index(): JsonResponse
    {
        $destinations = Destination::withCount([
            'hotels' => fn($q) => $q->whereHas(
                'currentStatut',
                fn($s) => $s->where('statut', 'actif')
            ),
        ])
        ->orderBy('nom')
        ->get()
        ->map(fn($d) => [
            'id'           => $d->id,
            'nom'          => $d->nom,
            'description'  => $d->description,
            'hotels_count' => $d->hotels_count,
        ]);

        return response()->json(['data' => $destinations]);
    }
}
