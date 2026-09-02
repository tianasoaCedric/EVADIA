<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            $validated['image_url'] = $request->file('image')->store('destinations', 's3');
        }

        if ($request->hasFile('couverture')) {
            $validated['couverture'] = array_map(
                fn ($file) => $file->store('destinations/couverture', 's3'),
                $request->file('couverture')
            );
        }

        unset($validated['image']);

        Destination::create($validated);

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
                Storage::disk('s3')->delete($destination->image_url);
            }
            $validated['image_url'] = $request->file('image')->store('destinations', 's3');
        }

        if ($request->hasFile('couverture')) {
            $nouvelles = array_map(
                fn ($file) => $file->store('destinations/couverture', 's3'),
                $request->file('couverture')
            );
            $validated['couverture'] = array_merge($destination->couverture ?? [], $nouvelles);
        }

        unset($validated['image']);

        $destination->update($validated);

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destination mise à jour.');
    }

    public function destroyCouverturePhoto(Destination $destination, int $index)
    {
        $couverture = $destination->couverture ?? [];

        if (isset($couverture[$index])) {
            Storage::disk('s3')->delete($couverture[$index]);
            unset($couverture[$index]);
            $destination->update(['couverture' => array_values($couverture)]);
        }

        return redirect()->route('admin.destinations.edit', $destination)
            ->with('success', 'Photo supprimée.');
    }

    public function destroy(Destination $destination)
    {
        if ($destination->image_url) {
            Storage::disk('s3')->delete($destination->image_url);
        }

        foreach ($destination->couverture ?? [] as $chemin) {
            Storage::disk('s3')->delete($chemin);
        }

        $destination->delete();

        return redirect()->route('admin.destinations.index')
            ->with('success', 'Destination supprimée.');
    }
}
