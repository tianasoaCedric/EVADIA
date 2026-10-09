<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Equipement;
use Illuminate\Http\Request;

class EquipementController extends Controller
{
    public function index()
    {
        $equipements = Equipement::orderBy('categorie')->orderBy('nom')->get()->groupBy('categorie');
        $categories  = Equipement::distinct()->orderBy('categorie')->pluck('categorie');

        return view('admin.equipements.index', compact('equipements', 'categories'));
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
        $nom = $equipement->nom;
        $equipement->proprietes()->detach();
        $equipement->delete();

        return back()->with('success', 'Équipement « ' . $nom . ' » supprimé.');
    }
}
