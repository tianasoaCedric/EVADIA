<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Destination;
use App\Models\Photo;
use App\Models\Service;
use App\Models\TypesHotel;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HotelContentController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function show()
    {
        $hotel = $this->getHotel();
        $hotel->load(['adresse', 'types', 'photos', 'services']);

        return view('hotel.content.show', compact('hotel'));
    }

    public function edit()
    {
        $hotel = $this->getHotel();
        $hotel->load(['adresse', 'types', 'photos', 'services', 'destinations']);
        $typesHotels = TypesHotel::all();
        $destinations = Destination::all();

        return view('hotel.content.edit', compact('hotel', 'typesHotels', 'destinations'));
    }

    public function update(Request $request)
    {
        $hotel = $this->getHotel();

        $request->validate([
            'nom' => 'required|max:200',
            'description' => 'nullable|string',
            'email_contact' => 'nullable|email|max:255',
            'telephone' => 'nullable|max:20',
            'site_web' => 'nullable|url|max:255',
            'etoiles' => 'nullable|integer|min:1|max:5',
            'types' => 'required|array|min:1',
            'types.*' => 'exists:types_hotels,id',
            'adresse_ligne1' => 'required|max:255',
            'adresse_ligne2' => 'nullable|max:255',
            'code_postal' => 'required|max:20',
            'ville' => 'required|max:100',
            'pays' => 'required|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        DB::transaction(function () use ($hotel, $request) {
            $hotel->update($request->only(['nom', 'description', 'email_contact', 'telephone', 'site_web', 'etoiles']));
            $hotel->types()->sync($request->types);

            if ($hotel->adresse) {
                $hotel->adresse()->update([
                    'adresse_ligne1' => $request->adresse_ligne1,
                    'adresse_ligne2' => $request->adresse_ligne2,
                    'code_postal' => $request->code_postal,
                    'ville' => $request->ville,
                    'pays' => $request->pays,
                    'latitude' => $request->latitude,
                    'longitude' => $request->longitude,
                ]);
            }

            $this->logAction('hotel_content_updated', "Contenu de l'hôtel {$hotel->nom} modifié");
        });

        return back()->with('success', 'Contenu de l\'hôtel mis à jour avec succès.');
    }

    public function uploadPhotos(Request $request)
    {
        $hotel = $this->getHotel();
        $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'image|max:5120',
        ]);

        $maxOrdre = $hotel->photos()->max('ordre') ?? 0;
        $isFirst = $hotel->photos()->count() === 0;

        foreach ($request->file('photos') as $i => $photo) {
            $path = $photo->store("hotels/{$hotel->id}", 's3');
            Photo::create([
                'entite_type' => 'hotel',
                'entite_id' => $hotel->id,
                'url_photo' => $path,
                'ordre' => $maxOrdre + $i + 1,
                'est_principale' => $isFirst && $i === 0,
                'uploaded_by' => auth('hotel')->id(),
            ]);
        }

        $this->logAction('hotel_photos_uploaded', count($request->file('photos')) . ' photo(s) ajoutée(s)');

        return back()->with('success', 'Photos ajoutées avec succès.');
    }

    public function deletePhoto($photo)
    {
        $hotel = $this->getHotel();
        $hotelPhoto = Photo::forHotel($hotel->id)->where('id', $photo)->firstOrFail();

        Storage::disk('s3')->delete($hotelPhoto->url_photo);
        $hotelPhoto->delete();

        $this->logAction('hotel_photo_deleted', "Photo supprimée");

        return back()->with('success', 'Photo supprimée.');
    }

    public function reorderPhotos(Request $request)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:photos,id',
        ]);

        $hotel = $this->getHotel();
        foreach ($request->order as $index => $photoId) {
            Photo::forHotel($hotel->id)->where('id', $photoId)->update(['ordre' => $index]);
        }

        return response()->json(['success' => true]);
    }

    public function services()
    {
        $hotel = $this->getHotel();
        $hotel->load('services');
        $services        = $hotel->services->sortBy('type_service')->groupBy('type_service');
        $types           = $hotel->services->pluck('type_service')->filter()->unique()->sort()->values();
        $allEquipements  = \App\Models\Equipement::orderBy('categorie')->orderBy('nom')
                            ->get(['id', 'nom', 'categorie'])
                            ->groupBy('categorie');

        return view('hotel.services.index', compact('hotel', 'services', 'types', 'allEquipements'));
    }

    public function storeService(Request $request)
    {
        $hotel = $this->getHotel();

        $request->validate([
            'nom' => 'required|max:200',
            'description' => 'nullable|string',
            'type_service' => 'nullable|max:100',
            'tarif' => 'nullable|numeric|min:0',
            'devise' => 'nullable|max:3',
        ]);

        $hotel->services()->create([
            'nom' => $request->nom,
            'description' => $request->description,
            'type_service' => $request->type_service,
            'tarif' => $request->tarif,
            'devise' => $request->devise ?? $hotel->devise_principale,
        ]);

        $this->logAction('hotel_service_created', "Service {$request->nom} ajouté");

        return back()->with('success', 'Service ajouté avec succès.');
    }

    public function updateService(Request $request, $service)
    {
        $hotel = $this->getHotel();
        $service = Service::where('id', $service)->where('hotel_id', $hotel->id)->firstOrFail();

        $request->validate([
            'nom' => 'required|max:200',
            'description' => 'nullable|string',
            'type_service' => 'nullable|max:100',
            'tarif' => 'nullable|numeric|min:0',
            'devise' => 'nullable|max:3',
        ]);

        $service->update($request->only(['nom', 'description', 'type_service', 'tarif', 'devise']));

        $this->logAction('hotel_service_updated', "Service {$service->nom} modifié");

        return back()->with('success', 'Service mis à jour.');
    }

    public function deleteService($service)
    {
        $hotel = $this->getHotel();
        $service = Service::where('id', $service)->where('hotel_id', $hotel->id)->firstOrFail();

        $serviceName = $service->nom;
        $service->delete();

        $this->logAction('hotel_service_deleted', "Service {$serviceName} supprimé");

        return back()->with('success', 'Service supprimé.');
    }
}
