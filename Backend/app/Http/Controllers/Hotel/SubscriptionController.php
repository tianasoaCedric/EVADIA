<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Abonnement;
use App\Models\Plan;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    use BelongsToHotel;

    public function index()
    {
        $hotel = $this->getHotel();

        $abonnementActif = Abonnement::where('hotel_id', $hotel->id)
            ->where('date_debut', '<=', now())
            ->where(fn($q) => $q->whereNull('date_fin')->orWhere('date_fin', '>=', now()))
            ->latest('date_debut')
            ->first();

        $historique = Abonnement::where('hotel_id', $hotel->id)
            ->orderByDesc('date_debut')
            ->get();

        $plans = Plan::actif()->get();

        return view('hotel.subscription.index', compact('hotel', 'abonnementActif', 'historique', 'plans'));
    }
}
