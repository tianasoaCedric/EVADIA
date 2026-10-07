<?php

namespace App\Http\Controllers\Hotel;

use App\Support\Media;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Offre;
use App\Models\Photo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OffrePhotoController extends Controller
{
    use BelongsToHotel;

    public function store(Request $request, int $offreId)
    {
        $hotel = $this->getHotel();
        $offre = Offre::where('id', $offreId)->where('hotel_id', $hotel->id)->firstOrFail();

        $request->validate([
            'photo' => 'required|image|max:5120',
        ]);

        // Supprime l'ancienne photo si elle existe
        $old = Photo::forOffre($offre->id)->first();
        if ($old) {
            Media::delete($old->url_photo);
            $old->delete();
        }

        $path = Media::storeImage($request->file('photo'), "offres/{$offre->id}");

        Photo::create([
            'entite_type'  => 'offre',
            'entite_id'    => $offre->id,
            'url_photo'    => $path,
            'ordre'        => 1,
            'est_principale' => true,
            'uploaded_by'  => auth()->id(),
        ]);

        return back()->with('success', 'Photo de l\'offre mise à jour.');
    }

    public function destroy(int $offreId, int $photoId)
    {
        $hotel = $this->getHotel();
        $offre = Offre::where('id', $offreId)->where('hotel_id', $hotel->id)->firstOrFail();

        $photo = Photo::forOffre($offre->id)->where('id', $photoId)->firstOrFail();
        Media::delete($photo->url_photo);
        $photo->delete();

        return back()->with('success', 'Photo supprimée.');
    }
}
