<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TypesHotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TypeHebergementController extends Controller
{
    public function index(Request $request)
    {
        $query = TypesHotel::withCount('hotels')->orderBy('nom');

        if ($search = $request->input('search')) {
            $query->where('nom', 'like', "%{$search}%");
        }

        $types = $query->paginate(20)->withQueryString();

        return view('admin.types-hebergement.index', compact('types'));
    }

    public function create()
    {
        return view('admin.types-hebergement.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'              => 'required|string|max:100',
            'description'      => 'nullable|string',
            'image'            => 'nullable|image|max:5120',
            'image_background' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('types-hebergement', 's3');
        }

        if ($request->hasFile('image_background')) {
            $validated['image_background'] = $request->file('image_background')->store('types-hebergement/background', 's3');
        }

        TypesHotel::create($validated);

        return redirect()->route('admin.types-hebergement.index')
            ->with('success', 'Type d\'hébergement créé avec succès.');
    }

    public function edit(TypesHotel $typesHebergement)
    {
        return view('admin.types-hebergement.edit', ['type' => $typesHebergement]);
    }

    public function update(Request $request, TypesHotel $typesHebergement)
    {
        $validated = $request->validate([
            'nom'              => 'required|string|max:100',
            'description'      => 'nullable|string',
            'image'            => 'nullable|image|max:5120',
            'image_background' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($typesHebergement->image) {
                Storage::disk('s3')->delete($typesHebergement->image);
            }
            $validated['image'] = $request->file('image')->store('types-hebergement', 's3');
        }

        if ($request->hasFile('image_background')) {
            if ($typesHebergement->image_background) {
                Storage::disk('s3')->delete($typesHebergement->image_background);
            }
            $validated['image_background'] = $request->file('image_background')->store('types-hebergement/background', 's3');
        }

        $typesHebergement->update($validated);

        return redirect()->route('admin.types-hebergement.index')
            ->with('success', 'Type d\'hébergement mis à jour.');
    }

    public function destroy(TypesHotel $typesHebergement)
    {
        if ($typesHebergement->image) {
            Storage::disk('s3')->delete($typesHebergement->image);
        }

        if ($typesHebergement->image_background) {
            Storage::disk('s3')->delete($typesHebergement->image_background);
        }

        $typesHebergement->delete();

        return redirect()->route('admin.types-hebergement.index')
            ->with('success', 'Type d\'hébergement supprimé.');
    }
}
