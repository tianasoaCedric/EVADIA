<?php

namespace App\Http\Controllers\Hotel;

use App\Actions\Reservation\RespondToReservationAction;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Reservation;
use App\Traits\LogsAdminAction;
use DomainException;
use Illuminate\Http\Request;

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
            'en_attente' => (clone $baseQuery)->where('statut', 'en_attente')->count(),
            'acceptee' => (clone $baseQuery)->where('statut', 'acceptee')->count(),
            'refusee' => (clone $baseQuery)->where('statut', 'refusee')->count(),
            'terminee' => (clone $baseQuery)->where('statut', 'terminee')->count(),
            'annulee' => (clone $baseQuery)->where('statut', 'annulee')->count(),
        ];

        $reservations = Reservation::with(['client', 'propriete', 'facture'])
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

        $reservation = Reservation::with(['client', 'propriete', 'facture', 'annuleePar', 'repondueParUser'])
            ->whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->where('id', $id)
            ->firstOrFail();

        return view('hotel.reservations.show', compact('reservation', 'hotel'));
    }

    public function accept(Request $request, $id)
    {
        $hotel = $this->getHotel();
        $reservation = Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->where('id', $id)->firstOrFail();

        try {
            app(RespondToReservationAction::class)->accept($reservation, auth()->id());
            $this->logAction('reservation_accepted', "Réservation {$reservation->code_reservation} acceptée");
        } catch (DomainException $e) {
            return back()->withErrors(['statut' => $e->getMessage()]);
        }

        return back()->with('success', 'Réservation acceptée, email de confirmation envoyé au client.');
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'raison_refus' => 'required|string',
        ]);

        $hotel = $this->getHotel();
        $reservation = Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->where('id', $id)->firstOrFail();

        try {
            app(RespondToReservationAction::class)->reject($reservation, auth()->id(), $request->raison_refus);
            $this->logAction('reservation_rejected', "Réservation {$reservation->code_reservation} refusée");
        } catch (DomainException $e) {
            return back()->withErrors(['statut' => $e->getMessage()]);
        }

        return back()->with('success', 'Réservation refusée, email envoyé au client.');
    }

    public function markDepositPaid($id)
    {
        $hotel = $this->getHotel();
        $reservation = Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->where('id', $id)->firstOrFail();

        try {
            app(RespondToReservationAction::class)->markDepositPaid($reservation);
            $this->logAction('reservation_deposit_paid', "Acompte confirmé pour la réservation {$reservation->code_reservation}");
        } catch (DomainException $e) {
            return back()->withErrors(['statut' => $e->getMessage()]);
        }

        return back()->with('success', 'Acompte confirmé. Vous pouvez maintenant accepter la réservation.');
    }
}
