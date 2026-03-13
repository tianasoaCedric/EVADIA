<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Abonnement;
use App\Models\Hotel;
use App\Models\LogAdmin;
use App\Models\Reservation;
use App\Models\User;
use App\Traits\LogsAdminAction;

class DashboardController extends Controller
{
    use LogsAdminAction;

    public function index()
    {
        // ── Statistiques en cartes ──
        $stats = [
            'total_users' => User::whereHas('roles', fn($q) => $q->where('code', 'client'))
                ->where('est_actif', true)->count(),
            'total_hotels' => Hotel::count(),
            'new_users_week' => User::where('date_inscription', '>=', now()->subDays(7))->count(),
            'reservations_en_cours' => Reservation::whereIn('statut', ['confirmed', 'en_cours'])->count(),
            'ca_abonnements_mois' => Abonnement::where('date_debut', '<=', now())
                ->where(fn($q) => $q->whereNull('date_fin')->orWhere('date_fin', '>=', now()))
                ->sum('prix_mensuel'),
            'abonnements_expirant' => Abonnement::whereBetween('date_fin', [now(), now()->addDays(30)])->count(),
        ];

        // ── Données graphiques (12 derniers mois) ──
        $inscriptions_par_mois = User::selectRaw("TO_CHAR(date_inscription, 'YYYY-MM') as mois, COUNT(*) as total")
            ->where('date_inscription', '>=', now()->subMonths(12))
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        $hotels_par_statut = Hotel::selectRaw('
                (SELECT statut FROM hotel_statuts WHERE hotel_statuts.hotel_id = hotels.id AND date_fin IS NULL LIMIT 1) as statut,
                COUNT(*) as total
            ')
            ->groupBy('statut')
            ->get();

        $revenus_par_mois = Abonnement::selectRaw("TO_CHAR(date_debut, 'YYYY-MM') as mois, SUM(prix_mensuel) as total")
            ->where('date_debut', '>=', now()->subMonths(12))
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        // ── Activités récentes ──
        $recent_users = User::latest('date_inscription')->take(5)->get();
        $recent_hotels = Hotel::latest('date_creation')->take(5)->get();
        $recent_reservations = Reservation::with(['client', 'propriete'])
            ->latest('date_reservation')->take(5)->get();
        $recent_logs = LogAdmin::with('admin')->latest('date_action')->take(10)->get();

        return view('admin.dashboard', compact(
            'stats',
            'inscriptions_par_mois',
            'hotels_par_statut',
            'revenus_par_mois',
            'recent_users',
            'recent_hotels',
            'recent_reservations',
            'recent_logs',
        ));
    }
}
