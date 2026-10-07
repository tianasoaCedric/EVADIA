<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Support\FrontendCache;
use App\Support\Media;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    public function index(Request $request)
    {
        $query = Destination::withCount('villes')->orderBy('nom');

        if ($search = $request->input('search')) {
            $query->where('nom', 'like', "%{$search}%");
        }

        $destinations = $query->paginate(15)->withQueryString();

        return view('admin.destinations.index', compact('destinations'));
    }

    public function create()
    {
        return view('admin.destinations.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:100',
            'description'  => 'nullable|string',
            'image'        => 'nullable|image|max:5120',
            'couverture'   => 'nullable|array',
            'couverture.*' => 'image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_url'] = Media::storeImage($request->file('image'), 'destinations');
        }

        if ($request->hasFile('couverture')) {
            $validated['couverture'] = array_map(
                fn ($file) => Media::storeImage($file, 'destinations/couverture'),
                $request->file('couverture')
            );
        }

        unset($validated['image']);

        Destination::create($validated);

        FrontendCache::purgerDestinationsEtVilles();

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destination créée avec succès.');
    }

    public function edit(Destination $destination)
    {
        return view('admin.destinations.edit', compact('destination'));
    }

    public function update(Request $request, Destination $destination)
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:100',
            'description'  => 'nullable|string',
            'image'        => 'nullable|image|max:5120',
            'couverture'   => 'nullable|array',
            'couverture.*' => 'image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            if ($destination->image_url) {
                Media::delete($destination->image_url);
            }
            $validated['image_url'] = Media::storeImage($request->file('image'), 'destinations');
        }

        if ($request->hasFile('couverture')) {
            $nouvelles = array_map(
                fn ($file) => Media::storeImage($file, 'destinations/couverture'),
                $request->file('couverture')
            );
            $validated['couverture'] = array_merge($destination->couverture ?? [], $nouvelles);
        }

        unset($validated['image']);

        $destination->update($validated);

        FrontendCache::purgerDestinationsEtVilles();

        // Photo changée : on reste sur la fiche pour voir la nouvelle photo en place
        $photos = array_filter([
            $request->hasFile('image') ? 'photo carte remplacée' : null,
            $request->hasFile('couverture') ? count($request->file('couverture')) . ' photo(s) de couverture ajoutée(s)' : null,
        ]);

        if ($photos) {
            return redirect()->route('admin.destinations.edit', $destination)
                ->with('success', 'Destination mise à jour — ' . implode(', ', $photos) . '. Le site est actualisé.')
                ->with('photo_modifiee', true);
        }

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destination mise à jour.');
    }

    public function destroyCouverturePhoto(Destination $destination, int $index)
    {
        $couverture = $destination->couverture ?? [];

        if (isset($couverture[$index])) {
            Media::delete($couverture[$index]);
            unset($couverture[$index]);
            $destination->update(['couverture' => array_values($couverture)]);
        }

        FrontendCache::purgerDestinationsEtVilles();

        return redirect()->route('admin.destinations.edit', $destination)
            ->with('success', 'Photo supprimée.');
    }

    public function destroy(Destination $destination)
    {
        if ($destination->image_url) {
            Media::delete($destination->image_url);
        }

        foreach ($destination->couverture ?? [] as $chemin) {
            Media::delete($chemin);
        }

        $destination->delete();

        FrontendCache::purgerDestinationsEtVilles();

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destination supprimée.');
    }
}
