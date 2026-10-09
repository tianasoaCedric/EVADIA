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

        // Abonnement en cours, même échu : un hôtel en retard ou suspendu doit
        // voir son échéance, pas un écran « aucun abonnement ».
        $abonnementActif = Abonnement::where('hotel_id', $hotel->id)
            ->where('date_debut', '<=', now())
            ->latest('date_debut')
            ->first();

        $historique = Abonnement::where('hotel_id', $hotel->id)
            ->orderByDesc('date_debut')
            ->get();

        $plans = Plan::actif()->get();

        return view('hotel.subscription.index', compact('hotel', 'abonnementActif', 'historique', 'plans'));
    }
}
