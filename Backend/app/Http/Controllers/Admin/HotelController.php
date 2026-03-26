<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHotelRequest;
use App\Http\Requests\Admin\UpdateHotelRequest;
use App\Jobs\SendHotelAdminCredentials;
use App\Models\Avis;
use App\Models\Destination;
use App\Models\Hotel;
use App\Models\HotelAdmin;
use App\Models\Photo;
use App\Models\HotelStatut;
use App\Models\LogAdmin;
use App\Models\Reservation;
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

        return view('admin.hotels.create', compact('types', 'destinations'));
    }

    public function store(StoreHotelRequest $request)
    {
        DB::transaction(function () use ($request) {
            // 1. Create hotel
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

            // 2. Attach types
            $hotel->types()->attach($request->types);

            // 3. Create address
            $hotel->adresse()->create([
                'adresse_ligne1' => $request->adresse_ligne1,
                'adresse_ligne2' => $request->adresse_ligne2,
                'code_postal' => $request->code_postal,
                'ville' => $request->ville,
                'pays' => $request->pays,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);

            // 4. Attach destination
            $hotel->destinations()->attach($request->destination_id);

            // 5. Upload photos
            if ($request->hasFile('photos')) {
                foreach ($request->file('photos') as $index => $photo) {
                    $path = $photo->store("hotels/{$hotel->id}", 's3');
                    Photo::create([
                        'entite_type' => 'hotel',
                        'entite_id' => $hotel->id,
                        'url_photo' => Storage::disk('s3')->url($path),
                        'ordre' => $index,
                        'est_principale' => $index === 0,
                        'uploaded_by' => auth()->id(),
                    ]);
                }
            }

            // 6. Create initial status
            HotelStatut::create([
                'hotel_id' => $hotel->id,
                'statut' => 'en_attente',
                'date_debut' => now(),
                'changed_by' => auth()->id(),
            ]);

            // 7. Create hotel admin user with temporary password
            $adminUser = User::create([
                'nom' => $request->admin_nom,
                'prenom' => $request->admin_prenom,
                'email' => $request->admin_email,
                'telephone' => $request->admin_telephone,
                'password_hash' => Hash::make('0000'),
                'force_password_change' => true,
                'email_verified' => true,
                'est_actif' => true,
            ]);

            // 8. Assign admin_hotel role
            $adminRole = Role::where('code', 'admin_hotel')->first();
            if ($adminRole) {
                $adminUser->roles()->attach($adminRole->id, [
                    'assigned_by' => auth()->id(),
                    'assigned_at' => now(),
                    'est_actif' => true,
                ]);
            }

            // 9. Link admin to hotel
            HotelAdmin::create([
                'user_id' => $adminUser->id,
                'hotel_id' => $hotel->id,
                'est_principal' => true,
                'date_debut' => now(),
            ]);

            // 10. Send credentials email via queue
            SendHotelAdminCredentials::dispatch($adminUser, $hotel);

            // 11. Log action
            $this->logAction('hotel_created', "Hôtel {$hotel->nom} créé (ID: {$hotel->id}). Admin: {$adminUser->email}");
        });

        return redirect()->route('admin.hotels.index')
            ->with('success', 'Hôtel créé avec succès. Un email avec les identifiants a été envoyé à l\'administrateur.');
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
            'note_moyenne' => Avis::whereHas('propriete', fn($q) => $q->where('hotel_id', $hotel->id))->avg('note'),
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
