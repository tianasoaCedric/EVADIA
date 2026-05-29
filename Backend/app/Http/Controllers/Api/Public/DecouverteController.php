<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\VilleDecouverte;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DecouverteController extends Controller
{
    public function villes(): JsonResponse
    {
        $villes = Cache::remember('decouverte:villes', 3600, function () {
            return VilleDecouverte::actif()
                ->withCount(['lieux' => fn($q) => $q->where('actif', true)])
                ->orderBy('ordre')
                ->orderBy('nom')
                ->get()
                ->map(fn($v) => [
                    'id'          => $v->id,
                    'nom'         => $v->nom,
                    'slug'        => $v->slug,
                    'image'       => $v->image ? \Storage::disk('s3')->url($v->image) : null,
                    'ordre'       => $v->ordre,
                    'lieux_count' => $v->lieux_count,
                ]);
        });

        return response()->json($villes);
    }

    public function lieux(string $slug): JsonResponse
    {
        $ville = VilleDecouverte::where('slug', $slug)->where('actif', true)->firstOrFail();

        $lieux = Cache::remember("decouverte:lieux:{$slug}", 3600, fn() => $ville->lieux()
            ->where('actif', true)
            ->orderBy('ordre')
            ->get()
            ->map(fn($l) => [
                'id'             => $l->id,
                'ville_id'       => $l->ville_id,
                'nom'            => $l->nom,
                'slug'           => $l->slug,
                'description'    => $l->description,
                'emplacement'    => $l->emplacement,
                'images'         => collect($l->images ?? [])->map(fn($path) => \Storage::disk('s3')->url($path))->values(),
                'position_image' => $l->position_image,
                'ordre'          => $l->ordre,
            ]));

        return response()->json([
            'ville' => [
                'id'    => $ville->id,
                'nom'   => $ville->nom,
                'slug'  => $ville->slug,
                'image' => $ville->image ? \Storage::disk('s3')->url($ville->image) : null,
            ],
            'lieux' => $lieux,
        ]);
    }
}
