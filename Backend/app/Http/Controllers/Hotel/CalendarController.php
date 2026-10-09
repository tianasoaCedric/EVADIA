<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Disponibilite;
use App\Models\Propriete;
use App\Models\Reservation;
use App\Services\DisponibiliteService;
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
        $proprietes = Propriete::where('hotel_id', $hotel->id)->select('id', 'nom', 'type_propriete', 'nombre_unites')->get();

        return view('hotel.calendar.index', compact('hotel', 'proprietes'));
    }

    public function getData(Request $request, DisponibiliteService $disponibiliteService)
    {
        $hotel = $this->getHotel();

        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'mois' => 'required|date_format:Y-m',
        ]);

        $propriete = Propriete::where('id', $request->propriete_id)
            ->where('hotel_id', $hotel->id)->firstOrFail();

        $debut = Carbon::parse($request->mois)->startOfMonth();
        $finExclusive = $debut->copy()->addMonth();
        $total = max(1, (int) $propriete->nombre_unites);

        $disponibilites = Disponibilite::where('propriete_id', $propriete->id)
            ->where('date', '>=', $debut->toDateString())
            ->where('date', '<', $finExclusive->toDateString())
            ->get()
            ->keyBy(fn($d) => $d->date->toDateString());

        $reservations = $disponibiliteService->reservationsActives($propriete, $debut, $finExclusive)
            ->load('client:id,nom,prenom,email');
        $parNuit = $disponibiliteService->reservationsParNuit($reservations, $debut, $finExclusive);

        $jours = [];
        foreach ($parNuit as $date => $occupants) {
            $dispo = $disponibilites->get($date);
            $occupees = $occupants->count();

            $jours[$date] = [
                'total'          => $total,
                'occupees'       => $occupees,
                'restantes'      => max(0, $total - $occupees),
                'confirmees'     => $occupants->where('statut', 'acceptee')->count(),
                'en_attente'     => $occupants->where('statut', 'en_attente')->count(),
                'ferme'          => $dispo && !$dispo->est_disponible,
                'prix_special'   => $dispo?->prix_special,
                'minimum_nuits'  => $dispo?->minimum_nuits,
                'reservations'   => $occupants->map(fn(Reservation $r) => [
                    'id'         => $r->id,
                    'code'       => $r->code_reservation,
                    'client'     => trim(($r->client?->prenom ?? '') . ' ' . ($r->client?->nom ?? '')) ?: ($r->client?->email ?? 'Client'),
                    'statut'     => $r->statut,
                    'date_debut' => $r->date_debut->format('d/m/Y'),
                    'date_fin'   => $r->date_fin->format('d/m/Y'),
                    'personnes'  => (int) $r->nb_adultes + (int) $r->nb_enfants,
                    'url'        => route('hotel.reservations.show', $r->id),
                ])->values(),
            ];
        }

        return response()->json([
            'nombre_unites' => $total,
            'prix_base'     => $propriete->currentPrix?->prix,
            'jours'         => $jours,
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

        // Une date avec des réservations reste modifiable : fermer la vente
        // bloque seulement les unités restantes, les séjours en cours sont conservés.
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

        // Comme pour une date seule : les réservations existantes sont conservées.
        foreach ($dates as $date) {
            $dateStr = $date->format('Y-m-d');

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

        return response()->json(['success' => true, 'message' => 'Disponibilités mises à jour.']);
    }
}
