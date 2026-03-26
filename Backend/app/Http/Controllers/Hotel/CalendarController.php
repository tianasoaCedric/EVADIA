<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Disponibilite;
use App\Models\Propriete;
use App\Models\Reservation;
use App\Traits\LogsAdminAction;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index()
    {
        $hotel = $this->getHotel();
        $proprietes = Propriete::where('hotel_id', $hotel->id)->select('id', 'nom', 'type_propriete')->get();

        return view('hotel.calendar.index', compact('hotel', 'proprietes'));
    }

    public function getData(Request $request)
    {
        $hotel = $this->getHotel();

        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'mois' => 'required|date_format:Y-m',
        ]);

        $propriete = Propriete::where('id', $request->propriete_id)
            ->where('hotel_id', $hotel->id)->firstOrFail();

        $debut = Carbon::parse($request->mois)->startOfMonth();
        $fin = Carbon::parse($request->mois)->endOfMonth();

        // Disponibilites
        $disponibilites = Disponibilite::where('propriete_id', $propriete->id)
            ->whereBetween('date', [$debut, $fin])
            ->get()
            ->keyBy(fn($d) => $d->date->format('Y-m-d'));

        // Reservations on this period
        $reservations = Reservation::where('propriete_id', $propriete->id)
            ->whereIn('statut', ['pending', 'paid'])
            ->where('date_debut', '<=', $fin)
            ->where('date_fin', '>=', $debut)
            ->with('client')
            ->get();

        return response()->json([
            'disponibilites' => $disponibilites,
            'reservations' => $reservations,
            'prix_base' => $propriete->currentPrix?->prix,
        ]);
    }

    public function updateDisponibilite(Request $request)
    {
        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'date' => 'required|date|after_or_equal:today',
            'est_disponible' => 'required|boolean',
            'prix_special' => 'nullable|numeric|min:0',
            'minimum_nuits' => 'nullable|integer|min:1',
        ]);

        $hotel = $this->getHotel();
        $propriete = Propriete::where('id', $request->propriete_id)
            ->where('hotel_id', $hotel->id)->firstOrFail();

        // Check no active reservation
        $hasReservation = Reservation::where('propriete_id', $request->propriete_id)
            ->whereIn('statut', ['pending', 'paid'])
            ->where('date_debut', '<=', $request->date)
            ->where('date_fin', '>', $request->date)
            ->exists();

        if ($hasReservation) {
            return back()->withErrors(['date' => 'Cette date a une réservation active, impossible de la modifier.']);
        }

        Disponibilite::updateOrCreate(
            ['propriete_id' => $request->propriete_id, 'date' => $request->date],
            [
                'est_disponible' => $request->est_disponible,
                'prix_special' => $request->prix_special,
                'devise_prix_special' => $request->devise ?? $hotel->devise_principale,
                'minimum_nuits' => $request->minimum_nuits,
                'updated_by' => auth()->id(),
            ]
        );

        return response()->json(['success' => true, 'message' => 'Disponibilité mise à jour.']);
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'date_debut' => 'required|date|after_or_equal:today',
            'date_fin' => 'required|date|after:date_debut',
            'est_disponible' => 'required|boolean',
            'prix_special' => 'nullable|numeric|min:0',
            'minimum_nuits' => 'nullable|integer|min:1',
        ]);

        $hotel = $this->getHotel();
        $propriete = Propriete::where('id', $request->propriete_id)
            ->where('hotel_id', $hotel->id)->firstOrFail();

        $dates = CarbonPeriod::create($request->date_debut, $request->date_fin);
        $skipped = 0;

        foreach ($dates as $date) {
            $dateStr = $date->format('Y-m-d');

            // Check no active reservation
            $hasReservation = Reservation::where('propriete_id', $request->propriete_id)
                ->whereIn('statut', ['pending', 'paid'])
                ->where('date_debut', '<=', $dateStr)
                ->where('date_fin', '>', $dateStr)
                ->exists();

            if ($hasReservation) {
                $skipped++;
                continue;
            }

            Disponibilite::updateOrCreate(
                ['propriete_id' => $request->propriete_id, 'date' => $dateStr],
                [
                    'est_disponible' => $request->est_disponible,
                    'prix_special' => $request->prix_special,
                    'devise_prix_special' => $request->devise ?? $hotel->devise_principale,
                    'minimum_nuits' => $request->minimum_nuits,
                    'updated_by' => auth()->id(),
                ]
            );
        }

        $message = 'Disponibilités mises à jour.';
        if ($skipped > 0) {
            $message .= " ({$skipped} date(s) ignorée(s) car réservée(s))";
        }

        return response()->json(['success' => true, 'message' => $message]);
    }
}
