<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Propriete;
use App\Models\ProprietePrix;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PricingController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index()
    {
        $hotel = $this->getHotel();

        $proprietes = Propriete::where('hotel_id', $hotel->id)
            ->with(['currentPrix', 'prix' => fn($q) => $q->orderByDesc('date_debut')])
            ->get();

        return view('hotel.pricing.index', compact('proprietes', 'hotel'));
    }

    public function updatePrice(Request $request, int $id)
    {
        $hotel = $this->getHotel();
        $propriete = Propriete::where('id', $id)->where('hotel_id', $hotel->id)->firstOrFail();

        $request->validate([
            'prix_mga' => 'required|numeric|min:0',
            'prix_eur' => 'required|numeric|min:0',
            'raison'   => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($propriete, $request) {
            $propriete->prix()->whereNull('date_fin')->update(['date_fin' => now()]);

            ProprietePrix::create([
                'propriete_id' => $propriete->id,
                'prix'         => $request->prix_mga,
                'devise'       => 'MGA',
                'prix_mga'     => $request->prix_mga,
                'prix_eur'     => $request->prix_eur ?: null,
                'date_debut'   => now(),
                'raison'       => $request->raison,
                'changed_by'   => $request->user()->id,
            ]);

            $this->logAction('price_updated', "Prix de {$propriete->nom} : {$request->prix_mga} MGA" . ($request->prix_eur ? " / {$request->prix_eur} EUR" : ''));
        });

        return back()->with('success', 'Prix mis à jour avec succès.');
    }
}
