<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\TypesHotel;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TypeHotelController extends Controller
{
    /**
     * Liste tous les types d'hôtels disponibles.
     * GET /api/types-hotels
     */
    public function index(): JsonResponse
    {
        $types = TypesHotel::orderBy('nom')
            ->get(['id', 'nom', 'description', 'image', 'image_background'])
            ->map(fn($t) => [
                'id'               => $t->id,
                'nom'              => $t->nom,
                'description'      => $t->description,
                'image'            => $t->image ? Storage::disk('s3')->url($t->image) : null,
                'image_background' => $t->image_background ? Storage::disk('s3')->url($t->image_background) : null,
            ]);

        return response()->json(['data' => $types]);
    }
}
