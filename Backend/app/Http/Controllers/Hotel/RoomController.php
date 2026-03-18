<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Equipement;
use App\Models\Paiement;
use App\Models\Photo;
use App\Models\Propriete;
use App\Models\ProprietePrix;
use App\Models\ProprieteStatut;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RoomController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function index(Request $request)
    {
        $hotel = $this->getHotel();

        $proprietes = Propriete::where('hotel_id', $hotel->id)
            ->with(['currentStatut', 'photos', 'currentPrix', 'equipements'])
            ->when($request->search, fn($q, $s) => $q->where('nom', 'ilike', "%$s%"))
            ->when($request->type, fn($q, $t) => $q->where('type_propriete', $t))
            ->when($request->statut, fn($q, $s) => $q->whereHas('currentStatut', fn($sq) => $sq->where('statut', $s)))
            ->orderBy('nom')
            ->paginate(20);

        return view('hotel.rooms.index', compact('proprietes', 'hotel'));
    }

    public function create()
    {
        $hotel = $this->getHotel();
        $equipements = Equipement::all()->groupBy('categorie');
        return view('hotel.rooms.create', compact('hotel', 'equipements'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|max:200',
            'description' => 'nullable|string',
            'type_propriete' => 'required|in:chambre,suite,villa,appartement,bungalow,studio',
            'capacite' => 'required|integer|min:1',
            'nb_chambres' => 'nullable|integer|min:0',
            'nb_lits' => 'nullable|integer|min:0',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|integer|min:1',
            'equipements' => 'nullable|array',
            'equipements.*.id' => 'exists:equipements,id',
            'equipements.*.quantite' => 'integer|min:1',
            'photos' => 'nullable|array',
            'photos.*' => 'image|max:5120',
            'prix' => 'required|numeric|min:0',
            'devise' => 'required|size:3',
        ]);

        DB::transaction(function () use ($request) {
            $hotel = $this->getHotel();

            $propriete = Propriete::create([
                'hotel_id' => $hotel->id,
                'nom' => $request->nom,
                'description' => $request->description,
                'type_propriete' => $request->type_propriete,
                'capacite' => $request->capacite,
                'nb_chambres' => $request->nb_chambres,
                'nb_lits' => $request->nb_lits,
                'nb_salles_bain' => $request->nb_salles_bain,
                'superficie' => $request->superficie,
                'created_by' => auth()->id(),
            ]);

            // Equipements
            if ($request->equipements) {
                foreach ($request->equipements as $eq) {
                    if (isset($eq['id'])) {
                        $propriete->equipements()->attach($eq['id'], ['quantite' => $eq['quantite'] ?? 1]);
                    }
                }
            }

            // Photos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $i => $photo) {
                    $path = $photo->store("proprietes/{$propriete->id}", 's3');
                    $propriete->photos()->create([
                        'url_photo' => $path,
                        'ordre' => $i,
                        'est_principale' => $i === 0,
                        'uploaded_by' => auth()->id(),
                    ]);
                }
            }

            // Initial status: disponible
            ProprieteStatut::create([
                'propriete_id' => $propriete->id,
                'statut' => 'disponible',
                'date_debut' => now(),
                'changed_by' => auth()->id(),
            ]);

            // Initial price
            ProprietePrix::create([
                'propriete_id' => $propriete->id,
                'prix' => $request->prix,
                'devise' => $request->devise,
                'date_debut' => now(),
                'changed_by' => auth()->id(),
            ]);

            $this->logAction('room_created', "Chambre {$propriete->nom} créée");
        });

        return redirect()->route('hotel.rooms.index')->with('success', 'Chambre créée avec succès.');
    }

    public function show($id)
    {
        $hotel = $this->getHotel();
        $propriete = Propriete::where('id', $id)->where('hotel_id', $hotel->id)
            ->with(['photos', 'equipements', 'currentStatut', 'currentPrix', 'statuts.changedBy', 'prix.changedBy', 'reservations.client', 'avis.client'])
            ->firstOrFail();

        // Stats
        $stats = [
            'total_reservations' => $propriete->reservations()->count(),
            'revenu_total' => Paiement::whereHas('reservation', fn($q) => $q->where('propriete_id', $propriete->id))->where('statut', 'completed')->sum('montant'),
            'note_moyenne' => $propriete->avis()->avg('note'),
            'taux_occupation' => $this->calculateOccupancy($propriete),
        ];

        return view('hotel.rooms.show', compact('propriete', 'hotel', 'stats'));
    }

    public function edit($id)
    {
        $hotel = $this->getHotel();
        $propriete = Propriete::where('id', $id)->where('hotel_id', $hotel->id)
            ->with(['photos', 'equipements', 'currentStatut', 'currentPrix'])
            ->firstOrFail();
        $equipements = Equipement::all()->groupBy('categorie');

        return view('hotel.rooms.edit', compact('propriete', 'hotel', 'equipements'));
    }

    public function update(Request $request, $id)
    {
        $hotel = $this->getHotel();
        $propriete = Propriete::where('id', $id)->where('hotel_id', $hotel->id)->firstOrFail();

        $request->validate([
            'nom' => 'required|max:200',
            'description' => 'nullable|string',
            'type_propriete' => 'required|in:chambre,suite,villa,appartement,bungalow,studio',
            'capacite' => 'required|integer|min:1',
            'nb_chambres' => 'nullable|integer|min:0',
            'nb_lits' => 'nullable|integer|min:0',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|integer|min:1',
            'equipements' => 'nullable|array',
        ]);

        DB::transaction(function () use ($propriete, $request) {
            $propriete->update($request->only([
                'nom',
                'description',
                'type_propriete',
                'capacite',
                'nb_chambres',
                'nb_lits',
                'nb_salles_bain',
                'superficie'
            ]));

            // Sync equipements
            if ($request->has('equipements')) {
                $syncData = [];
                foreach ($request->equipements as $eq) {
                    if (isset($eq['id'])) {
                        $syncData[$eq['id']] = ['quantite' => $eq['quantite'] ?? 1];
                    }
                }
                $propriete->equipements()->sync($syncData);
            } else {
                $propriete->equipements()->detach();
            }

            $this->logAction('room_updated', "Chambre {$propriete->nom} modifiée");
        });

        return redirect()->route('hotel.rooms.show', $propriete->id)->with('success', 'Chambre mise à jour.');
    }

    public function updateStatus(Request $request, $id)
    {
        $hotel = $this->getHotel();
        $propriete = Propriete::where('id', $id)->where('hotel_id', $hotel->id)->firstOrFail();

        $request->validate([
            'statut' => 'required|in:disponible,indisponible,maintenance,hors_service',
            'raison' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($propriete, $request) {
            $propriete->statuts()->whereNull('date_fin')->update(['date_fin' => now()]);

            ProprieteStatut::create([
                'propriete_id' => $propriete->id,
                'statut' => $request->statut,
                'date_debut' => now(),
                'raison' => $request->raison,
                'changed_by' => auth()->id(),
            ]);

            $this->logAction('room_status_changed', "Statut de {$propriete->nom} → {$request->statut}");
        });

        return back()->with('success', 'Statut mis à jour.');
    }

    private function calculateOccupancy(Propriete $propriete): float
    {
        $totalDays = 30; // last 30 days
        $occupiedDays = $propriete->reservations()
            ->whereIn('statut', ['paid', 'confirmed'])
            ->where('date_debut', '<=', now())
            ->where('date_fin', '>=', now()->subDays(30))
            ->get()
            ->sum(function ($reservation) {
                $start = max($reservation->date_debut, now()->subDays(30));
                $end = min($reservation->date_fin, now());
                return max(0, $start->diffInDays($end));
            });

        return $totalDays > 0 ? round(($occupiedDays / $totalDays) * 100, 1) : 0;
    }
}
