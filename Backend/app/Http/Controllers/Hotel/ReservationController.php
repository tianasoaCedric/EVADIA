<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Notification;
use App\Models\PolitiqueAnnulation;
use App\Models\Reservation;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index(Request $request)
    {
        $hotel = $this->getHotel();

        $baseQuery = Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id));

        // Counts per status
        $counts = [
            'all' => (clone $baseQuery)->count(),
            'draft' => (clone $baseQuery)->where('statut', 'draft')->count(),
            'pending' => (clone $baseQuery)->where('statut', 'pending')->count(),
            'paid' => (clone $baseQuery)->where('statut', 'paid')->count(),
            'cancelled' => (clone $baseQuery)->where('statut', 'cancelled')->count(),
        ];

        $reservations = Reservation::with(['client', 'propriete', 'paiements'])
            ->whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->when($request->statut, fn($q, $s) => $q->where('statut', $s))
            ->when($request->search, function ($q, $s) {
                $q->where(function ($sq) use ($s) {
                    $sq->where('code_reservation', 'ilike', "%$s%")
                        ->orWhereHas('client', fn($cq) => $cq->where('nom', 'ilike', "%$s%")->orWhere('prenom', 'ilike', "%$s%"));
                });
            })
            ->when($request->propriete, fn($q, $p) => $q->where('propriete_id', $p))
            ->when($request->date_debut, fn($q, $d) => $q->where('date_debut', '>=', $d))
            ->when($request->date_fin, fn($q, $d) => $q->where('date_fin', '<=', $d))
            ->latest('date_reservation')
            ->paginate(20);

        $proprietes = $hotel->proprietes()->select('id', 'nom')->get();

        return view('hotel.reservations.index', compact('reservations', 'counts', 'hotel', 'proprietes'));
    }

    public function show($id)
    {
        $hotel = $this->getHotel();

        $reservation = Reservation::with(['client', 'propriete', 'paiements', 'annuleePar'])
            ->whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->where('id', $id)
            ->firstOrFail();

        return view('hotel.reservations.show', compact('reservation', 'hotel'));
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'statut' => 'required|in:pending,paid,cancelled',
            'raison_annulation' => 'required_if:statut,cancelled|nullable|string',
        ]);

        $hotel = $this->getHotel();
        $reservation = Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->where('id', $id)->firstOrFail();

        // Transition rules
        $allowedTransitions = [
            'pending' => ['paid', 'cancelled'],
            'paid' => ['cancelled'],
            'draft' => ['cancelled'],
        ];

        if (!in_array($request->statut, $allowedTransitions[$reservation->statut] ?? [])) {
            return back()->withErrors(['statut' => 'Transition de statut non autorisée.']);
        }

        DB::transaction(function () use ($reservation, $request) {
            $originalStatut = $reservation->statut;

            $reservation->update([
                'statut' => $request->statut,
                'annulee_par' => $request->statut === 'cancelled' ? auth()->id() : null,
                'raison_annulation' => $request->raison_annulation,
            ]);

            // Notify client
            Notification::create([
                'user_id' => $reservation->client_id,
                'type_notification' => 'reservation_' . $request->statut,
                'titre' => 'Mise à jour de votre réservation ' . $reservation->code_reservation,
                'contenu' => $request->statut === 'cancelled'
                    ? "Votre réservation a été annulée. Raison : {$request->raison_annulation}"
                    : "Votre réservation est maintenant confirmée et payée.",
                'lien' => '/reservations/' . $reservation->id,
                'reservation_id' => $reservation->id,
                'canal' => 'in_app',
                'date_envoi' => now(),
            ]);

            $this->logAction('reservation_status_changed', "Réservation {$reservation->code_reservation} → {$request->statut}");
        });

        return back()->with('success', 'Statut de la réservation mis à jour.');
    }
}
