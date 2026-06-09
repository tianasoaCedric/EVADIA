<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\VilleDecouverte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VilleDecouverteController extends Controller
{
    public function index(Request $request)
    {
        $query = VilleDecouverte::withCount('lieux')->orderBy('ordre')->orderBy('nom');

        if ($search = $request->input('search')) {
            $query->where('nom', 'like', "%{$search}%");
        }

        if ($request->has('actif') && $request->input('actif') !== '') {
            $query->where('actif', $request->boolean('actif'));
        }

        $villes = $query->paginate(15)->withQueryString();

        return view('admin.decouverte.villes.index', compact('villes'));
    }

    public function create()
    {
        return view('admin.decouverte.villes.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'   => 'required|string|max:150',
            'image' => 'nullable|image|max:4096',
            'ordre' => 'nullable|integer|min:0',
            'actif' => 'boolean',
        ]);

        $validated['slug']       = Str::slug($validated['nom']);
        $validated['created_by'] = auth()->id();
        $validated['actif']      = $request->boolean('actif');
        $validated['ordre']      = $validated['ordre'] ?? 0;

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('decouverte/villes', 's3');
        }

        VilleDecouverte::create($validated);

        return redirect()->route('admin.decouverte.villes.index')
            ->with('success', 'Ville créée avec succès.');
    }

    public function show(VilleDecouverte $ville)
    {
        $ville->load(['lieux' => fn($q) => $q->orderBy('ordre'), 'createdBy']);

        return view('admin.decouverte.villes.show', compact('ville'));
    }

    public function edit(VilleDecouverte $ville)
    {
        return view('admin.decouverte.villes.edit', compact('ville'));
    }

    public function update(Request $request, VilleDecouverte $ville)
    {
        $validated = $request->validate([
            'nom'   => 'required|string|max:150',
            'image' => 'nullable|image|max:4096',
            'ordre' => 'nullable|integer|min:0',
            'actif' => 'boolean',
        ]);

        $validated['actif'] = $request->boolean('actif');
        $validated['ordre'] = $validated['ordre'] ?? 0;

        if ($request->hasFile('image')) {
            if ($ville->image) {
                Storage::disk('s3')->delete($ville->image);
            }
            $validated['image'] = $request->file('image')->store('decouverte/villes', 's3');
        }

        $ville->update($validated);

        return redirect()->route('admin.decouverte.villes.index')
            ->with('success', 'Ville mise à jour.');
    }

    public function destroy(VilleDecouverte $ville)
    {
        if ($ville->image) {
            Storage::disk('s3')->delete($ville->image);
        }

        $ville->delete();

        return redirect()->route('admin.decouverte.villes.index')
            ->with('success', 'Ville supprimée.');
    }

    public function toggle(VilleDecouverte $ville)
    {
        $ville->update(['actif' => ! $ville->actif]);

        return back()->with('success', $ville->actif ? 'Ville activée.' : 'Ville désactivée.');
    }
}
