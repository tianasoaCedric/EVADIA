<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\AvantageOffre;
use App\Models\Offre;
use App\Models\OffreApplication;
use App\Models\TypesAvantage;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HotelOffreController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index(Request $request)
    {
        $hotel = $this->getHotel();

        // Hotel's own offers
        $mesOffres = Offre::where('hotel_id', $hotel->id)
            ->withCount('utilisations')
            ->latest()->paginate(10, ['*'], 'mes_offres_page');

        // EVADIA offers that apply to this hotel (read-only)
        $offresEvadia = Offre::where(function ($q) use ($hotel) {
            $q->whereHas('avantages.applications', function ($sq) use ($hotel) {
                $sq->where('entite_type', 'hotel')->where('entite_id', $hotel->id);
            })->orWhereHas('avantages.applications', function ($sq) use ($hotel) {
                $sq->where('entite_type', 'propriete')
                    ->whereIn('entite_id', $hotel->proprietes->pluck('id'));
            });
        })
            ->where(fn($q) => $q->whereNull('hotel_id')->orWhere('hotel_id', '!=', $hotel->id))
            ->latest()->paginate(10, ['*'], 'offres_evadia_page');

        return view('hotel.offers.index', compact('mesOffres', 'offresEvadia', 'hotel'));
    }

    public function create()
    {
        $hotel = $this->getHotel();
        $proprietes = $hotel->proprietes()->select('id', 'nom')->get();
        $services = $hotel->services()->select('id', 'nom')->get();
        $typesAvantages = TypesAvantage::all();

        return view('hotel.offers.create', compact('hotel', 'proprietes', 'services', 'typesAvantages'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|max:200',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'code_promo' => 'nullable|string|max:50|unique:offres,code_promo',
            'avantages' => 'required|array|min:1',
            'avantages.*.type_avantage_id' => 'required|exists:types_avantages,id',
            'avantages.*.valeur' => 'required|string',
            'avantages.*.entite_type' => 'required|in:hotel,propriete,service',
            'avantages.*.entite_id' => 'required|integer',
        ]);

        $hotel = $this->getHotel();

        DB::transaction(function () use ($request, $hotel) {
            $offre = Offre::create([
                'hotel_id' => $hotel->id,
                'titre' => $request->titre,
                'description' => $request->description,
                'date_debut' => $request->date_debut,
                'date_fin' => $request->date_fin,
                'code_promo' => $request->code_promo,
                'statut' => 'active',
                'created_by' => auth()->id(),
                'created_at' => now(),
            ]);

            foreach ($request->avantages as $avantage) {
                $av = AvantageOffre::create([
                    'offre_id' => $offre->id,
                    'type_avantage_id' => $avantage['type_avantage_id'],
                    'valeur' => $avantage['valeur'],
                    'quantite_max' => $avantage['quantite_max'] ?? null,
                    'created_at' => now(),
                ]);

                OffreApplication::create([
                    'avantage_id' => $av->id,
                    'entite_type' => $avantage['entite_type'],
                    'entite_id' => $avantage['entite_id'],
                ]);
            }

            $this->logAction('offer_created', "Offre {$offre->titre} créée");
        });

        return redirect()->route('hotel.offers.index')->with('success', 'Offre créée avec succès.');
    }

    public function edit($id)
    {
        $offre = Offre::where('id', $id)->where('hotel_id', $this->getHotel()->id)->with('avantages.applications')->firstOrFail();
        $hotel = $this->getHotel();
        $proprietes = $hotel->proprietes()->select('id', 'nom')->get();
        $services = $hotel->services()->select('id', 'nom')->get();
        $typesAvantages = TypesAvantage::all();

        return view('hotel.offers.edit', compact('offre', 'hotel', 'proprietes', 'services', 'typesAvantages'));
    }

    public function update(Request $request, $id)
    {
        $offre = Offre::where('id', $id)->where('hotel_id', $this->getHotel()->id)->firstOrFail();

        $request->validate([
            'titre' => 'required|max:200',
            'description' => 'nullable|string',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
            'code_promo' => 'nullable|string|max:50|unique:offres,code_promo,' . $offre->id,
        ]);

        $offre->update($request->only(['titre', 'description', 'date_debut', 'date_fin', 'code_promo']));

        $this->logAction('offer_updated', "Offre {$offre->titre} modifiée");

        return redirect()->route('hotel.offers.index')->with('success', 'Offre mise à jour.');
    }

    public function toggle($id)
    {
        $offre = Offre::where('id', $id)->where('hotel_id', $this->getHotel()->id)->firstOrFail();
        $offre->update(['statut' => $offre->statut === 'active' ? 'inactive' : 'active']);

        $this->logAction('offer_toggled', "Offre {$offre->titre} → {$offre->statut}");

        return back()->with('success', 'Statut de l\'offre modifié.');
    }
}
