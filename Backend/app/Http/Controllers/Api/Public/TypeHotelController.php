<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\TypesHotel;
use Illuminate\Http\JsonResponse;

class TypeHotelController extends Controller
{
    /**
     * Liste tous les types d'hôtels disponibles.
     * GET /api/types-hotels
     */
    public function index(): JsonResponse
    {
        $types = TypesHotel::orderBy('nom')
            ->get(['id', 'nom', 'description']);

        return response()->json(['data' => $types]);
    }
}
