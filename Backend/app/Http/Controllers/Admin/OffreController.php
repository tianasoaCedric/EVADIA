<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOffreRequest;
use App\Models\Hotel;
use App\Models\Offre;
use App\Models\Propriete;
use App\Models\Service;
use App\Models\TypesAvantage;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OffreController extends Controller
{
    use LogsAdminAction;

    public function index(Request $request)
    {
        $offres = Offre::withCount('utilisations')
            ->when($request->search, fn($q, $s) => $q->where('titre', 'ilike', "%$s%")
                ->orWhere('code_promo', 'ilike', "%$s%"))
            ->when($request->statut, fn($q, $s) => $q->where('statut', $s))
            ->when($request->periode, function ($q, $p) {
                if ($p === 'en_cours')
                    return $q->where('date_debut', '<=', now())->where('date_fin', '>=', now());
                if ($p === 'a_venir')
                    return $q->where('date_debut', '>', now());
                if ($p === 'terminee')
                    return $q->where('date_fin', '<', now());
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('admin.offers.index', compact('offres'));
    }

    public function create()
    {
        $typesAvantages = TypesAvantage::all();
        $hotels = Hotel::orderBy('nom')->get(['id', 'nom']);
        $proprietes = Propriete::with('hotel')->get(['id', 'nom', 'hotel_id']);
        $services = Service::with('hotel')->get(['id', 'nom', 'hotel_id']);

        return view('admin.offers.create', compact('typesAvantages', 'hotels', 'proprietes', 'services'));
    }

    public function store(StoreOffreRequest $request)
    {
        DB::transaction(function () use ($request) {
            $offre = Offre::create([
                'titre' => $request->titre,
                'description' => $request->description,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'code_promo' => $request->code_promo,
                'statut' => $request->statut ?? 'active',
                'created_by' => auth()->id(),
            ]);

            foreach ($request->avantages as $avantageData) {
                $avantage = $offre->avantages()->create([
                    'type_avantage_id' => $avantageData['type_avantage_id'],
                    'valeur' => $avantageData['valeur'],
                    'quantite_max' => $avantageData['quantite_max'] ?? null,
                ]);

                foreach ($avantageData['applications'] ?? [] as $app) {
                    $avantage->applications()->create([
                        'entite_type' => $app['entite_type'],
                        'entite_id' => $app['entite_id'],
                    ]);
                }
            }

            $this->logAction('offre_created', "Offre '{$offre->titre}' créée (ID: {$offre->id})");
        });

        return redirect()->route('admin.offers.index')
            ->with('success', 'Offre créée avec succès.');
    }

    public function show(Offre $offer)
    {
        $offer->load([
            'avantages.type',
            'avantages.applications',
            'utilisations.client',
            'utilisations.reservation',
            'createdBy',
        ]);

        return view('admin.offers.show', compact('offer'));
    }

    public function edit(Offre $offer)
    {
        $offer->load(['avantages.type', 'avantages.applications']);
        $typesAvantages = TypesAvantage::all();
        $hotels = Hotel::orderBy('nom')->get(['id', 'nom']);
        $proprietes = Propriete::with('hotel')->get(['id', 'nom', 'hotel_id']);
        $services = Service::with('hotel')->get(['id', 'nom', 'hotel_id']);

        return view('admin.offers.edit', compact('offer', 'typesAvantages', 'hotels', 'proprietes', 'services'));
    }

    public function update(Request $request, Offre $offer)
    {
        $request->validate([
            'titre' => 'required|string|max:200',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'code_promo' => "nullable|string|max:50|unique:offres,code_promo,{$offer->id}",
            'statut' => 'nullable|string|in:active,inactive,brouillon',
        ]);

        DB::transaction(function () use ($request, $offer) {
            $offer->update($request->only([
                'titre',
                'description',
                'date_debut',
                'date_fin',
                'code_promo',
                'statut',
            ]));

            // If avantages are present, sync them
            if ($request->has('avantages')) {
                // Delete old avantages (cascade will handle applications)
                $offer->avantages()->delete();

                foreach ($request->avantages as $avantageData) {
                    $avantage = $offer->avantages()->create([
                        'type_avantage_id' => $avantageData['type_avantage_id'],
                        'valeur' => $avantageData['valeur'],
                        'quantite_max' => $avantageData['quantite_max'] ?? null,
                    ]);

                    foreach ($avantageData['applications'] ?? [] as $app) {
                        $avantage->applications()->create([
                            'entite_type' => $app['entite_type'],
                            'entite_id' => $app['entite_id'],
                        ]);
                    }
                }
            }

            $this->logAction('offre_updated', "Offre '{$offer->titre}' modifiée (ID: {$offer->id})");
        });

        return redirect()->route('admin.offers.show', $offer)
            ->with('success', 'Offre mise à jour avec succès.');
    }

    public function toggle(Offre $offer)
    {
        $newStatus = $offer->statut === 'active' ? 'inactive' : 'active';
        $offer->update(['statut' => $newStatus]);

        $this->logAction('offre_toggled', "Offre '{$offer->titre}' {$newStatus}");

        return back()->with('success', "Offre {$newStatus} avec succès.");
    }

    /**
     * Generate a unique promo code (API endpoint for Alpine.js).
     */
    public function generatePromoCode()
    {
        do {
            $code = 'EVADIA-' . strtoupper(Str::random(6));
        } while (Offre::where('code_promo', $code)->exists());

        return response()->json(['code' => $code]);
    }
}
