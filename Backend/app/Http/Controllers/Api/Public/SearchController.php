<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Hotel;
use App\Models\LieuDecouverte;
use App\Models\TypesHotel;
use App\Models\Ville;
use App\Models\VilleDecouverte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SearchController extends Controller
{
    /**
     * Recherche unifiée — hôtels, destinations, villes, types d'hébergement.
     *
     * GET /api/search?q=antananarivo
     * GET /api/search?q=antan&suggest=1   (mode autocomplete, résultats limités)
     */
    public function __invoke(Request $request): JsonResponse
    {
        $q       = trim($request->string('q'));
        $suggest = $request->boolean('suggest');

        if (strlen($q) < 2) {
            return response()->json(['hotels' => [], 'destinations' => [], 'villes' => [], 'types' => [], 'decouverte_villes' => [], 'decouverte_lieux' => []]);
        }

        $like    = "%{$q}%";
        $mode    = $suggest ? 'suggest' : 'full';
        $cacheKey = "search:{$mode}:" . md5($q);
        $ttl      = $suggest ? 300 : 600; // suggest: 5 min, full: 10 min

        $result = Cache::remember($cacheKey, $ttl, function () use ($q, $like, $suggest) {
            // ── Hôtels actifs ────────────────────────────────────────────────
            $hotelLimit = $suggest ? 4 : 20;
            $hotels = Hotel::with([
                    'photos'  => fn($q) => $q->where('est_principale', true)->limit(1),
                    'adresse',
                    // Charge les prix en une seule requête — évite le N+1
                    'proprietes.currentPrix',
                ])
                ->whereHas('currentStatut', fn($s) => $s->where('statut', 'actif'))
                ->where(fn($q) => $q
                    ->where('nom', 'ilike', $like)
                    ->orWhereHas('adresse', fn($aq) => $aq->where('ville', 'ilike', $like))
                )
                ->limit($hotelLimit)
                ->get()
                ->map(fn(Hotel $h) => [
                    'id'               => $h->id,
                    'nom'              => $h->nom,
                    'ville'            => $h->adresse?->ville,
                    'pays'             => $h->adresse?->pays,
                    'etoiles'          => $h->etoiles,
                    'photo_principale' => $h->photos->first()?->url,
                    'prix_min_mga'     => $h->proprietes->min(fn($p) => $p->currentPrix?->prix_mga),
                    'prix_min_eur'     => $h->proprietes->min(fn($p) => $p->currentPrix?->prix_eur),
                    'note_moyenne'     => $h->note_moyenne,
                ]);

            // ── Destinations ─────────────────────────────────────────────────
            $destLimit = $suggest ? 3 : 10;
            $destinations = Destination::where('nom', 'ilike', $like)
                ->orWhere('description', 'ilike', $like)
                ->limit($destLimit)
                ->get(['id', 'nom', 'description', 'image_url'])
                ->map(fn($d) => [
                    'id'        => $d->id,
                    'nom'       => $d->nom,
                    'image_url' => $d->image_url ? Storage::disk('s3')->url($d->image_url) : null,
                ]);

            // ── Villes ───────────────────────────────────────────────────────
            $villeLimit = $suggest ? 3 : 15;
            $villes = Ville::with('destination')
                ->where('nom', 'ilike', $like)
                ->limit($villeLimit)
                ->get()
                ->map(fn($v) => [
                    'id'              => $v->id,
                    'nom'             => $v->nom,
                    'destination_nom' => $v->destination?->nom,
                    'image'           => $v->image ? Storage::disk('s3')->url($v->image) : null,
                ]);

            // ── Types d'hébergement ───────────────────────────────────────────
            $typeLimit = $suggest ? 2 : 10;
            $types = TypesHotel::where('nom', 'ilike', $like)
                ->orWhere('description', 'ilike', $like)
                ->limit($typeLimit)
                ->get(['id', 'nom', 'image'])
                ->map(fn($t) => [
                    'id'    => $t->id,
                    'nom'   => $t->nom,
                    'image' => $t->image ? Storage::disk('s3')->url($t->image) : null,
                ]);

            // ── Villes Découverte ─────────────────────────────────────────────
            $decVilleLimit = $suggest ? 2 : 8;
            $decouverte_villes = VilleDecouverte::actif()
                ->where('nom', 'ilike', $like)
                ->limit($decVilleLimit)
                ->get(['id', 'nom', 'slug', 'image'])
                ->map(fn($v) => [
                    'id'    => $v->id,
                    'nom'   => $v->nom,
                    'slug'  => $v->slug,
                    'image' => $v->image ? Storage::disk('s3')->url($v->image) : null,
                ]);

            // ── Lieux Découverte ──────────────────────────────────────────────
            $decLieuLimit = $suggest ? 2 : 10;
            $decouverte_lieux = LieuDecouverte::actif()
                ->with('ville')
                ->where(fn($q) => $q
                    ->where('nom', 'ilike', $like)
                    ->orWhere('description', 'ilike', $like)
                    ->orWhere('emplacement', 'ilike', $like)
                )
                ->limit($decLieuLimit)
                ->get()
                ->map(fn($l) => [
                    'id'         => $l->id,
                    'nom'        => $l->nom,
                    'slug'       => $l->slug,
                    'ville_slug' => $l->ville?->slug,
                    'ville_nom'  => $l->ville?->nom,
                    'image'      => !empty($l->images[0]) ? Storage::disk('s3')->url($l->images[0]) : null,
                ]);

            return compact('hotels', 'destinations', 'villes', 'types', 'decouverte_villes', 'decouverte_lieux');
        });

        return response()->json($result);
    }
}
