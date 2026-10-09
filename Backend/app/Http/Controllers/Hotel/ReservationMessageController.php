<?php

namespace App\Http\Controllers\Hotel;

use App\Actions\Reservation\SendReservationMessageAction;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Message;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationMessageController extends Controller
{
    use BelongsToHotel;

    public function show(int $reservationId)
    {
        $hotel = $this->getHotel();

        $reservation = Reservation::with('client')
            ->whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->findOrFail($reservationId);

        $messages = Message::where('reservation_id', $reservation->id)
            ->orderBy('date_envoi')
            ->get();

        Message::where('reservation_id', $reservation->id)
            ->where('destinataire_id', auth('hotel')->id())
            ->where('lu', false)
            ->update(['lu' => true]);

        return view('hotel.reservations.messages', compact('reservation', 'messages', 'hotel'));
    }

    public function store(Request $request, int $reservationId)
    {
        $request->validate([
            'contenu' => 'required|string',
        ]);

        $hotel = $this->getHotel();

        $reservation = Reservation::with('client')
            ->whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))
            ->findOrFail($reservationId);

        app(SendReservationMessageAction::class)->send(
            $reservation,
            auth('hotel')->user(),
            $reservation->client,
            $request->contenu
        );

        return back()->with('success', 'Message envoyé.');
    }
}
