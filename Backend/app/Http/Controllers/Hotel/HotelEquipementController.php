<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Equipement;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;

class HotelEquipementController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index()
    {
        $equipements = Equipement::orderBy('categorie')->orderBy('nom')->get()->groupBy('categorie');
        $categories  = Equipement::distinct()->orderBy('categorie')->pluck('categorie');

        return view('hotel.equipements.index', compact('equipements', 'categories'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'       => 'required|string|max:100|unique:equipements,nom',
            'categorie' => 'required|string|max:50',
            'icone'     => 'nullable|string|max:50',
        ]);

        Equipement::create($validated);

        return back()->with('success', 'Équipement « ' . $validated['nom'] . ' » ajouté.');
    }

    public function destroy(Equipement $equipement)
    {
        if ($equipement->proprietes()->exists()) {
            return back()->withErrors(['delete' => 'Impossible de supprimer un équipement utilisé par des chambres.']);
        }

        $nom = $equipement->nom;
        $equipement->delete();

        return back()->with('success', 'Équipement « ' . $nom . ' » supprimé.');
    }

    public function search(Request $request)
    {
        $q = $request->input('q', '');

        $equipements = Equipement::when($q, fn($query) => $query->where('nom', 'ilike', "%{$q}%"))
            ->orderBy('categorie')
            ->orderBy('nom')
            ->limit(20)
            ->get(['id', 'nom', 'categorie', 'icone']);

        return response()->json($equipements);
    }

    public function storeAjax(Request $request)
    {
        $validated = $request->validate([
            'nom'       => 'required|string|max:100|unique:equipements,nom',
            'categorie' => 'required|string|max:50',
        ]);

        $eq = Equipement::create($validated);

        return response()->json(['id' => $eq->id, 'nom' => $eq->nom, 'categorie' => $eq->categorie]);
    }
}
