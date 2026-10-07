<?php

namespace App\Http\Controllers\Admin;

use App\Support\Media;
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
            $validated['image'] = Media::storeImage($request->file('image'), 'types-hebergement');
        }

        if ($request->hasFile('image_background')) {
            $validated['image_background'] = Media::storeImage($request->file('image_background'), 'types-hebergement/background');
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
                Media::delete($typesHebergement->image);
            }
            $validated['image'] = Media::storeImage($request->file('image'), 'types-hebergement');
        }

        if ($request->hasFile('image_background')) {
            if ($typesHebergement->image_background) {
                Media::delete($typesHebergement->image_background);
            }
            $validated['image_background'] = Media::storeImage($request->file('image_background'), 'types-hebergement/background');
        }

        $typesHebergement->update($validated);

        return redirect()->route('admin.types-hebergement.index')
            ->with('success', 'Type d\'hébergement mis à jour.');
    }

    public function destroy(TypesHotel $typesHebergement)
    {
        if ($typesHebergement->image) {
            Media::delete($typesHebergement->image);
        }

        if ($typesHebergement->image_background) {
            Media::delete($typesHebergement->image_background);
        }

        $typesHebergement->delete();

        return redirect()->route('admin.types-hebergement.index')
            ->with('success', 'Type d\'hébergement supprimé.');
    }
}
