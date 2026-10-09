<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Offre;
use App\Models\Propriete;
use App\Services\OffreService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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
        ->whereDate('date_fin', '>=', today());

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('titre', 'ilike', "%{$search}%")
                  ->orWhereHas('hotel', fn($q2) => $q2->where('nom', 'ilike', "%{$search}%"))
                  ->orWhereHas('hotel.adresse', fn($q2) => $q2->where('ville', 'ilike', "%{$search}%"))
                  ->orWhereHas('hotel.destinations', fn($q2) => $q2->where('nom', 'ilike', "%{$search}%"));
            });
        }

        if ($discountMin = $request->integer('discount_min')) {
            $query->where('remise_pct', '>=', $discountMin);
        }

        if ($startDate = $request->input('start_date')) {
            $query->where('date_fin', '>=', $startDate);
        }

        if ($endDate = $request->input('end_date')) {
            $query->where('date_debut', '<=', $endDate);
        }

        $offres = $query->latest('created_at')->paginate(12);
        $offres->getCollection()->transform(fn($o) => $this->formatOffre($o));

        return response()->json($offres);
    }

    /**
     * Détail d'une offre (public).
     * GET /api/offres/{id}
     */
    public function show(int $id, OffreService $offres): JsonResponse
    {
        $formatted = Cache::remember("offre:{$id}", 1800, function () use ($id, $offres) {
            $offre = Offre::with([
                'photos',
                'hotel.photos' => fn($q) => $q->where('est_principale', true),
                'hotel.adresse',
                'hotel.destinations',
            ])
            ->whereNotNull('hotel_id')
            ->find($id);

            if (!$offre) return null;

            $data = $this->formatOffre($offre);
            $data['statut'] = $offre->statut;
            $data['hotel_id'] = $offre->hotel_id;
            $data['phone'] = $offre->hotel?->telephone;
            $data['email'] = $offre->hotel?->email_contact;
            $data['terms'] = $offre->conditions ?? [];
            // Chambres concernées : la page offre y envoie le client pour réserver
            $data['proprietes'] = $offres->proprietesApplicables($offre)
                ?->map(fn($p) => ['id' => $p->id, 'nom' => $p->nom])->values()->all() ?? [];
            return $data;
        });

        // Contrôlé hors cache : une offre désactivée ou terminée n'est plus visible,
        // même par lien direct (le cache n'expire pas quand la date de fin passe).
        if (!$formatted || $formatted['statut'] !== 'active' || $formatted['date_fin'] < today()->toDateString()) {
            return response()->json(['message' => 'Offre introuvable'], 404);
        }

        // Offre à venir : visible, mais pas encore réservable
        $formatted['en_cours'] = $formatted['date_debut'] <= today()->toDateString();

        return response()->json($formatted);
    }

    /**
     * Aperçu du prix avec l'offre pour une chambre et des dates (public : un
     * visiteur voit la réduction avant de se connecter).
     * GET /api/offres/{id}/apercu?propriete_id=&date_debut=&date_fin=&devise=
     */
    public function apercu(int $id, Request $request, OffreService $offres): JsonResponse
    {
        $validated = $request->validate([
            'propriete_id' => 'required|integer|exists:proprietes,id',
            'date_debut'   => 'required|date',
            'date_fin'     => 'required|date|after:date_debut',
            'devise'       => 'nullable|string|in:MGA,EUR',
        ]);

        $offre = $offres->trouverActive($id);
        if (!$offre) {
            return response()->json(['applicable' => false, 'message' => 'Cette offre n\'est plus disponible.']);
        }

        // Même calcul du prix de base que la création de réservation
        $propriete = Propriete::with('currentPrix')->findOrFail($validated['propriete_id']);
        $devise    = strtoupper($validated['devise'] ?? 'MGA');
        $nbNuits   = Carbon::parse($validated['date_debut'])->diffInDays(Carbon::parse($validated['date_fin']));
        $prixBase  = ($propriete->currentPrix?->getPrixPourDevise($devise) ?? 0) * $nbNuits;

        $resultat = $offres->calculer($offre, $propriete, $prixBase, (int) $nbNuits, null);

        if (!$resultat['valide']) {
            return response()->json(['applicable' => false, 'message' => $resultat['message']]);
        }

        return response()->json([
            'applicable'          => true,
            'offre'               => $offre->titre,
            'prix_base'           => $prixBase,
            'montant_reduction'   => $resultat['montant_reduction'],
            'prix_total'          => max(0, $prixBase - $resultat['montant_reduction']),
            'devise'              => $devise,
            'avantages_en_nature' => $resultat['avantages_en_nature'],
        ]);
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
