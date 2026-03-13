<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHotelRequest;
use App\Http\Requests\Admin\UpdateHotelRequest;
use App\Models\Destination;
use App\Models\Hotel;
use App\Models\HotelAdmin;
use App\Models\HotelPhoto;
use App\Models\HotelStatut;
use App\Models\Role;
use App\Models\TypesHotel;
use App\Models\User;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class HotelController extends Controller
{
    use LogsAdminAction;

    public function index(Request $request)
    {
        $hotels = Hotel::with(['adresse', 'currentStatut', 'abonnement', 'types'])
            ->when($request->search, fn($q, $s) => $q->where('nom', 'ilike', "%$s%")
                ->orWhereHas('adresse', fn($aq) => $aq->where('ville', 'ilike', "%$s%")))
            ->when($request->statut, fn($q, $s) => $q->whereHas('currentStatut', fn($sq) => $sq->where('statut', $s)))
            ->when($request->etoiles, fn($q, $e) => $q->where('etoiles', $e))
            ->when($request->destination, fn($q, $d) => $q->whereHas('destinations', fn($dq) => $dq->where('destination_id', $d)))
            ->latest('date_creation')
            ->paginate(20)
            ->withQueryString();

        $destinations = Destination::all();

        return view('admin.hotels.index', compact('hotels', 'destinations'));
    }

    public function create()
    {
        $types = TypesHotel::all();
        $destinations = Destination::all();
        $users = User::orderBy('nom')->get(['id', 'nom', 'prenom', 'email']);

        return view('admin.hotels.create', compact('types', 'destinations', 'users'));
    }

    public function store(StoreHotelRequest $request)
    {
        DB::transaction(function () use ($request) {
            // Create hotel
            $hotel = Hotel::create([
                'nom' => $request->nom,
                'description' => $request->description,
                'email_contact' => $request->email_contact,
                'telephone' => $request->telephone,
                'site_web' => $request->site_web,
                'etoiles' => $request->etoiles,
                'devise_principale' => $request->devise_principale ?? 'EUR',
                'created_by' => auth()->id(),
            ]);

            // Attach types
            $hotel->types()->attach($request->types);

            // Create address
            $hotel->adresse()->create([
                'adresse_ligne1' => $request->adresse_ligne1,
                'adresse_ligne2' => $request->adresse_ligne2,
                'code_postal' => $request->code_postal,
                'ville' => $request->ville,
                'pays' => $request->pays,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            // Attach destination
            $hotel->destinations()->attach($request->destination_id);

            // Upload photos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $index => $photo) {
                    $path = $photo->store("hotels/{$hotel->id}", 's3');
                    HotelPhoto::create([
                        'hotel_id' => $hotel->id,
                        'url_photo' => Storage::disk('s3')->url($path),
                        'ordre' => $index,
                        'est_principale' => $index === 0,
                        'uploaded_by' => auth()->id(),
                    ]);
                }
            }

            // Create initial status
            HotelStatut::create([
                'hotel_id' => $hotel->id,
                'statut' => 'en_attente',
                'date_debut' => now(),
                'changed_by' => auth()->id(),
            ]);

            // Assign hotel admin
            $adminUserId = $request->admin_user_id;

            if ($request->has('new_admin') && $request->new_admin) {
                $newAdmin = User::create([
                    'nom' => $request->input('new_admin.nom'),
                    'prenom' => $request->input('new_admin.prenom'),
                    'email' => $request->input('new_admin.email'),
                    'password_hash' => Hash::make('Evadia2026!'),
                    'telephone' => $request->input('new_admin.telephone'),
                    'email_verified' => true,
                ]);

                $adminRole = Role::where('code', 'admin_hotel')->first();
                if ($adminRole) {
                    $newAdmin->roles()->attach($adminRole->id, [
                        'assigned_by' => auth()->id(),
                        'assigned_at' => now(),
                        'est_actif' => true,
                    ]);
                }

                $adminUserId = $newAdmin->id;
            }

            if ($adminUserId) {
                HotelAdmin::create([
                    'user_id' => $adminUserId,
                    'hotel_id' => $hotel->id,
                    'est_principal' => true,
                    'date_debut' => now(),
                ]);

                // Ensure admin_hotel role
                $adminRole = Role::where('code', 'admin_hotel')->first();
                $existingUser = User::find($adminUserId);
                if ($adminRole && $existingUser && !$existingUser->hasRole('admin_hotel')) {
                    $existingUser->roles()->attach($adminRole->id, [
                        'assigned_by' => auth()->id(),
                        'assigned_at' => now(),
                        'est_actif' => true,
                    ]);
                }
            }

            $this->logAction('hotel_created', "Hôtel {$hotel->nom} créé (ID: {$hotel->id})");
        });

        return redirect()->route('admin.hotels.index')
            ->with('success', 'Hôtel créé avec succès.');
    }

    public function show(Hotel $hotel)
    {
        $hotel->load([
            'adresse',
            'types',
            'photos',
            'proprietes',
            'statuts' => fn($q) => $q->orderByDesc('date_debut'),
            'abonnement',
            'admins.user',
            'destinations',
        ]);

        // Stats
        $stats = [
            'nb_reservations' => Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->count(),
            'note_moyenne' => \App\Models\Avis::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->avg('note'),
        ];

        return view('admin.hotels.show', compact('hotel', 'stats'));
    }

    public function edit(Hotel $hotel)
    {
        $hotel->load(['adresse', 'types', 'destinations']);
        $types = TypesHotel::all();
        $destinations = Destination::all();

        return view('admin.hotels.edit', compact('hotel', 'types', 'destinations'));
    }

    public function update(UpdateHotelRequest $request, Hotel $hotel)
    {
        DB::transaction(function () use ($request, $hotel) {
            $hotel->update($request->only([
                'nom',
                'description',
                'email_contact',
                'telephone',
                'site_web',
                'etoiles',
                'devise_principale',
            ]));

            $hotel->types()->sync($request->types);

            $hotel->adresse()->updateOrCreate(
                ['hotel_id' => $hotel->id],
                $request->only([
                    'adresse_ligne1',
                    'adresse_ligne2',
                    'code_postal',
                    'ville',
                    'pays',
                    'latitude',
                    'longitude',
                ])
            );

            $hotel->destinations()->sync([$request->destination_id]);

            $this->logAction('hotel_updated', "Hôtel {$hotel->nom} modifié (ID: {$hotel->id})");
        });

        return redirect()->route('admin.hotels.show', $hotel)
            ->with('success', 'Hôtel mis à jour avec succès.');
    }

    public function updateStatus(Request $request, Hotel $hotel)
    {
        $request->validate([
            'statut' => 'required|in:actif,en_attente,suspendu,ferme',
            'raison' => 'nullable|string',
        ]);

        DB::transaction(function () use ($request, $hotel) {
            // Close current status
            $hotel->statuts()->whereNull('date_fin')->update(['date_fin' => now()]);

            // Create new status
            HotelStatut::create([
                'hotel_id' => $hotel->id,
                'statut' => $request->statut,
                'date_debut' => now(),
                'raison' => $request->raison,
                'changed_by' => auth()->id(),
            ]);

            $this->logAction('hotel_status_updated', "Statut de l'hôtel {$hotel->nom} changé en '{$request->statut}'");
        });

        return back()->with('success', 'Statut mis à jour avec succès.');
    }

    public function destroy(Hotel $hotel)
    {
        $name = $hotel->nom;
        $hotel->delete();

        $this->logAction('hotel_deleted', "Hôtel {$name} supprimé");

        return redirect()->route('admin.hotels.index')
            ->with('success', 'Hôtel supprimé avec succès.');
    }
}
