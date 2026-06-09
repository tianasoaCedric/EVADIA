<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LieuDecouverte;
use App\Models\VilleDecouverte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LieuDecouverteController extends Controller
{
    public function index(Request $request, VilleDecouverte $ville)
    {
        $query = $ville->lieux()->orderBy('ordre')->orderBy('nom');

        if ($search = $request->input('search')) {
            $query->where('nom', 'like', "%{$search}%");
        }

        $lieux = $query->paginate(15)->withQueryString();

        return view('admin.decouverte.lieux.index', compact('ville', 'lieux'));
    }

    public function create(VilleDecouverte $ville)
    {
        return view('admin.decouverte.lieux.create', compact('ville'));
    }

    public function store(Request $request, VilleDecouverte $ville)
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:150',
            'description'    => 'nullable|string',
            'emplacement'    => 'nullable|string|max:255',
            'images.*'       => 'nullable|image|max:4096',
            'position_image' => 'required|in:left,right',
            'ordre'          => 'nullable|integer|min:0',
            'actif'          => 'boolean',
        ]);

        $validated['ville_id']   = $ville->id;
        $validated['slug']       = Str::slug($validated['nom']);
        $validated['created_by'] = auth()->id();
        $validated['actif']      = $request->boolean('actif');
        $validated['ordre']      = $validated['ordre'] ?? 0;

        $chemins = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $chemins[] = $file->store('decouverte/lieux', 's3');
            }
        }
        $validated['images'] = $chemins ?: null;

        LieuDecouverte::create($validated);

        return redirect()->route('admin.decouverte.villes.lieux.index', $ville)
            ->with('success', 'Lieu créé avec succès.');
    }

    public function show(VilleDecouverte $ville, LieuDecouverte $lieu)
    {
        return view('admin.decouverte.lieux.show', compact('ville', 'lieu'));
    }

    public function edit(VilleDecouverte $ville, LieuDecouverte $lieu)
    {
        return view('admin.decouverte.lieux.edit', compact('ville', 'lieu'));
    }

    public function update(Request $request, VilleDecouverte $ville, LieuDecouverte $lieu)
    {
        $validated = $request->validate([
            'nom'            => 'required|string|max:150',
            'description'    => 'nullable|string',
            'emplacement'    => 'nullable|string|max:255',
            'images.*'       => 'nullable|image|max:4096',
            'position_image' => 'required|in:left,right',
            'ordre'          => 'nullable|integer|min:0',
            'actif'          => 'boolean',
        ]);

        $validated['actif'] = $request->boolean('actif');
        $validated['ordre'] = $validated['ordre'] ?? 0;

        $existingImages = $lieu->images ?? [];

        // Supprimer les images cochées
        if ($request->has('delete_images')) {
            foreach ($request->input('delete_images') as $path) {
                Storage::disk('s3')->delete($path);
                $existingImages = array_filter($existingImages, fn($p) => $p !== $path);
            }
        }

        // Ajouter les nouvelles images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $existingImages[] = $file->store('decouverte/lieux', 's3');
            }
        }

        $validated['images'] = array_values($existingImages) ?: null;

        $lieu->update($validated);

        return redirect()->route('admin.decouverte.villes.lieux.index', $ville)
            ->with('success', 'Lieu mis à jour.');
    }

    public function destroy(VilleDecouverte $ville, LieuDecouverte $lieu)
    {
        if ($lieu->images) {
            foreach ($lieu->images as $path) {
                Storage::disk('s3')->delete($path);
            }
        }

        $lieu->delete();

        return redirect()->route('admin.decouverte.villes.lieux.index', $ville)
            ->with('success', 'Lieu supprimé.');
    }

    public function toggle(VilleDecouverte $ville, LieuDecouverte $lieu)
    {
        $lieu->update(['actif' => ! $lieu->actif]);

        return back()->with('success', $lieu->actif ? 'Lieu activé.' : 'Lieu désactivé.');
    }
}
