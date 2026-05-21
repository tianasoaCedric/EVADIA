<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Hotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class VilleController extends Controller
{
    /**
     * Recherche de villes par nom (autocomplete).
     * GET /api/villes/search?q=nos&destination_id=1
     */
    public function search(): JsonResponse
    {
        $q             = request()->string('q')->trim()->toString();
        $destinationId = request()->integer('destination_id', 0);

        $query = \App\Models\Ville::query()->orderBy('nom');

        if ($q !== '') {
            $query->where('nom', 'ilike', "%{$q}%");
        }

        if ($destinationId > 0) {
            $query->where('destination_id', $destinationId);
        }

        $villes = $query->limit(20)->get(['id', 'nom', 'destination_id']);

        return response()->json(['data' => $villes]);
    }

    /**
     * Liste les villes d'une destination.
     * GET /api/destinations/{id}/villes
     */
    public function byDestination(int $id): JsonResponse
    {
        $destination = Destination::with('villes')->find($id);

        if (!$destination) {
            return response()->json(['message' => 'Destination introuvable'], 404);
        }

        $villes = $destination->villes->map(fn($v) => [
            'id'             => $v->id,
            'nom'            => $v->nom,
            'destination_id' => $v->destination_id,
        ]);

        return response()->json([
            'data' => [
                'destination' => [
                    'id'          => $destination->id,
                    'nom'         => $destination->nom,
                    'description' => $destination->description,
                    'image_url'   => $destination->image_url,
                ],
                'villes' => $villes,
            ],
        ]);
    }

    /**
     * Hôtels actifs d'une destination (12 par page, triés par note).
     * GET /api/destinations/{id}/hotels?page=1&popular=1
     */
    public function hotels(int $id): JsonResponse
    {
        if (!Destination::where('id', $id)->exists()) {
            return response()->json(['message' => 'Destination introuvable'], 404);
        }

        $popular   = request()->boolean('popular');
        $selection = request()->boolean('selection');

        $query = Hotel::with(['photos' => fn($q) => $q->where('est_principale', true), 'adresse'])
            ->whereHas('currentStatut', fn($q) => $q->where('statut', 'actif'))
            ->whereHas('destinations', fn($q) => $q->where('destinations.id', $id));

        // Sélection : uniquement les hôtels avec abonnement Signature actif
        if ($selection) {
            $query->whereHas('abonnements', fn($q) => $q
                ->where('type_abonnement', 'signature')
                ->where(fn($q2) => $q2->whereNull('date_fin')->orWhere('date_fin', '>=', now()))
            );
        }

        // Populaires : triés par nombre de réservations (la déduplication avec la sélection est gérée côté frontend)
        if ($popular) {
            $hotels = $query
                ->select('hotels.*')
                ->addSelect(DB::raw('(
                    SELECT COUNT(r.id)
                    FROM reservations r
                    INNER JOIN proprietes p ON r.propriete_id = p.id
                    WHERE p.hotel_id = hotels.id
                    AND r.statut IN (\'confirmee\', \'terminee\')
                ) as nb_reservations'))
                ->orderByDesc('nb_reservations')
                ->limit(10)
                ->get();

            return response()->json(['data' => $this->formatHotels($hotels)]);
        }

        $hotels = $query->paginate(12);
        $hotels->getCollection()->transform(fn($h) => $this->formatHotel($h));

        return response()->json($hotels);
    }

    /**
     * Hôtels actifs dans une ville spécifique.
     * GET /api/villes/{id}/hotels?selection=1&page=1
     */
    public function hotelsByVille(int $id): JsonResponse
    {
        $ville = \App\Models\Ville::find($id);

        if (!$ville) {
            return response()->json(['message' => 'Ville introuvable'], 404);
        }

        $selection = request()->boolean('selection');

        $query = Hotel::with(['photos' => fn($q) => $q->where('est_principale', true), 'adresse'])
            ->whereHas('currentStatut', fn($q) => $q->where('statut', 'actif'))
            ->whereHas('adresse', fn($q) => $q->where('ville', 'ilike', $ville->nom));

        if ($selection) {
            $query->whereHas('abonnements', fn($q) => $q
                ->where('type_abonnement', 'signature')
                ->where(fn($q2) => $q2->whereNull('date_fin')->orWhere('date_fin', '>=', now()))
            );
            $hotels = $query->get();
            return response()->json(['data' => $this->formatHotels($hotels)]);
        }

        $hotels = $query->paginate(12);
        $hotels->getCollection()->transform(fn($h) => $this->formatHotel($h));

        return response()->json($hotels);
    }

    private function formatHotels(\Illuminate\Support\Collection $hotels): \Illuminate\Support\Collection
    {
        return $hotels->map(fn($h) => $this->formatHotel($h));
    }

    private function formatHotel(Hotel $hotel): array
    {
        $proprietes = $hotel->proprietes()
            ->whereHas('currentPrix')
            ->with('currentPrix')
            ->get();

        $prixMin    = $proprietes->min(fn($p) => $p->currentPrix?->prix);
        $prixMinMga = $proprietes->min(fn($p) => $p->currentPrix?->prix_mga);
        $prixMinEur = $proprietes->min(fn($p) => $p->currentPrix?->prix_eur);

        $noteMoyenne = $hotel->proprietes()
            ->withAvg('avis', 'note')
            ->get()
            ->avg('avis_avg_note');

        return [
            'id'               => $hotel->id,
            'nom'              => $hotel->nom,
            'etoiles'          => $hotel->etoiles,
            'photo_principale' => $hotel->photos->first()?->url,
            'ville'            => $hotel->adresse?->ville,
            'prix_min'         => $prixMin,
            'prix_min_mga'     => $prixMinMga,
            'prix_min_eur'     => $prixMinEur,
            'note_moyenne'     => $noteMoyenne ? round($noteMoyenne, 1) : null,
            'nb_avis'          => $hotel->proprietes()->withCount('avis')->get()->sum('avis_count'),
        ];
    }
}
