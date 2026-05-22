<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\Ville;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VilleController extends Controller
{
    public function index(Request $request)
    {
        $query = Ville::with('destination')->orderBy('nom');

        if ($search = $request->input('search')) {
            $query->where('nom', 'like', "%{$search}%");
        }

        if ($destinationId = $request->input('destination_id')) {
            $query->where('destination_id', $destinationId);
        }

        $villes       = $query->paginate(20)->withQueryString();
        $destinations = Destination::orderBy('nom')->get();

        return view('admin.villes.index', compact('villes', 'destinations'));
    }

    public function create()
    {
        $destinations = Destination::orderBy('nom')->get();

        return view('admin.villes.create', compact('destinations'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'destination_id' => 'required|exists:destinations,id',
            'description'    => 'nullable|string',
            'code_postal'    => 'nullable|string|max:20',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
            'image'          => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('villes', 's3');
        }

        Ville::create($validated);

        return redirect()->route('admin.villes.index')
            ->with('success', 'Ville créée avec succès.');
    }

    public function edit(Ville $ville)
    {
        $destinations = Destination::orderBy('nom')->get();

        return view('admin.villes.edit', compact('ville', 'destinations'));
    }

    public function update(Request $request, Ville $ville)
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:100',
            'destination_id' => 'required|exists:destinations,id',
            'description'    => 'nullable|string',
            'code_postal'    => 'nullable|string|max:20',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
            'image'          => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($ville->image) {
                Storage::disk('s3')->delete($ville->image);
            }
            $validated['image'] = $request->file('image')->store('villes', 's3');
        }

        $ville->update($validated);

        return redirect()->route('admin.villes.index')
            ->with('success', 'Ville mise à jour.');
    }

    public function destroy(Ville $ville)
    {
        if ($ville->image) {
            Storage::disk('s3')->delete($ville->image);
        }

        $ville->delete();

        return redirect()->route('admin.villes.index')
            ->with('success', 'Ville supprimée.');
    }
}
