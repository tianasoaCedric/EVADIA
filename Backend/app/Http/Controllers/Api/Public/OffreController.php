<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Offre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OffreController extends Controller
{
    /**
     * Liste paginée des offres actives (publiques).
     * GET /api/offres?page=1&search=
     */
    public function index(Request $request): JsonResponse
    {
        $query = Offre::with([
            'photos',
            'hotel.photos' => fn($q) => $q->where('est_principale', true),
            'hotel.adresse',
            'hotel.destinations',
        ])
        ->whereNotNull('hotel_id')
        ->where('statut', 'active')
        ->where('date_fin', '>=', now());

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'ilike', "%{$search}%")
                  ->orWhereHas('hotel', fn($q2) => $q2->where('nom', 'ilike', "%{$search}%"))
                  ->orWhereHas('hotel.adresse', fn($q2) => $q2->where('ville', 'ilike', "%{$search}%"))
                  ->orWhereHas('hotel.destinations', fn($q2) => $q2->where('nom', 'ilike', "%{$search}%"));
            });
        }

        $offres = $query->latest('created_at')->paginate(12);
        $offres->getCollection()->transform(fn($o) => $this->formatOffre($o));

        return response()->json($offres);
    }

    /**
     * Détail d'une offre (public).
     * GET /api/offres/{id}
     */
    public function show(int $id): JsonResponse
    {
        $offre = Offre::with([
            'photos',
            'hotel.photos' => fn($q) => $q->where('est_principale', true),
            'hotel.adresse',
            'hotel.destinations',
        ])
        ->whereNotNull('hotel_id')
        ->find($id);

        if (!$offre) {
            return response()->json(['message' => 'Offre introuvable'], 404);
        }

        $formatted = $this->formatOffre($offre);
        $formatted['phone']  = $offre->hotel?->telephone;
        $formatted['email']  = $offre->hotel?->email_contact;
        $formatted['terms']  = $offre->conditions ?? [];

        return response()->json($formatted);
    }

    private function formatOffre(Offre $offre): array
    {
        $hotel        = $offre->hotel;
        // Photo dédiée à l'offre en priorité, sinon photo principale de l'hôtel
        $photo        = $offre->photos->first()?->url ?? $hotel?->photos->first()?->url;
        $city         = $hotel?->adresse?->ville ?? '';
        $destination  = $hotel?->destinations->first()?->nom ?? $city;

        return [
            'id'          => $offre->id,
            'titre'       => $offre->titre,
            'description' => $offre->description,
            'hotel_nom'   => $hotel?->nom ?? '',
            'city'        => $city,
            'destination' => $destination,
            'photo'       => $photo,
            'discount'    => $offre->remise_pct,
            'date_debut'  => $offre->date_debut?->toDateString(),
            'date_fin'    => $offre->date_fin?->toDateString(),
            'start_day'   => (int) $offre->date_debut?->format('d'),
            'end_day'     => (int) $offre->date_fin?->format('d'),
            'month_num'   => (int) $offre->date_fin?->format('m'),
        ];
    }
}
