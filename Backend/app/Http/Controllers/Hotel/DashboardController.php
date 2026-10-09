<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Avis;
use App\Models\Message;
use App\Models\Propriete;
use App\Models\Reservation;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index()
    {
        $hotel = $this->getHotel();

        $stats = [
            // Reservations
            'reservations_total' => Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->count(),
            'reservations_pending' => Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->where('statut', 'en_attente')->count(),
            'reservations_paid' => Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->where('statut', 'acceptee')->count(),
            'reservations_draft' => Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->where('statut', 'en_attente')->count(),

            // Revenue
            'revenus_mois' => Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
                ->whereIn('statut', ['acceptee', 'terminee'])
                ->whereMonth('date_reponse', now()->month)
                ->whereYear('date_reponse', now()->year)
                ->sum('prix_total'),

            // Properties
            'total_proprietes' => Propriete::where('hotel_id', $hotel->id)->count(),
            'proprietes_disponibles' => Propriete::where('hotel_id', $hotel->id)
                ->whereHas('currentStatut', fn($q) => $q->where('statut', 'disponible'))->count(),

            // Reviews
            'note_moyenne' => Avis::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->avg('note'),
            'avis_sans_reponse' => Avis::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->whereNull('reponse_hotel')->count(),

            // Unread messages
            'messages_non_lus' => Message::where('destinataire_id', auth()->id())->where('lu', false)->count(),
        ];

        // Charts - reservations by month (last 12 months)
        $reservations_par_mois = Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->selectRaw("TO_CHAR(date_reservation, 'YYYY-MM') as mois, COUNT(*) as total")
            ->where('date_reservation', '>=', now()->subMonths(12))
            ->groupBy('mois')->orderBy('mois')->get();

        // Charts - revenue by month
        $revenus_par_mois = Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->whereIn('statut', ['acceptee', 'terminee'])
            ->selectRaw("TO_CHAR(date_reponse, 'YYYY-MM') as mois, SUM(prix_total) as total")
            ->where('date_reponse', '>=', now()->subMonths(12))
            ->groupBy('mois')->orderBy('mois')->get();

        // Upcoming arrivals (next 7 days)
        $prochaines_arrivees = Reservation::with(['client', 'propriete'])
            ->whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->whereIn('statut', ['acceptee'])
            ->whereBetween('date_debut', [now(), now()->addDays(7)])
            ->orderBy('date_debut')->get();

        // Latest reviews
        $derniers_avis = Avis::with(['client', 'propriete'])
            ->whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->latest('date_avis')->take(5)->get();

        return view('hotel.dashboard', compact(
            'hotel',
            'stats',
            'reservations_par_mois',
            'revenus_par_mois',
            'prochaines_arrivees',
            'derniers_avis'
        ));
    }
}
