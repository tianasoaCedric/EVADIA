<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use App\Models\Photo;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HotelPhotoController extends Controller
{
    use LogsAdminAction;

    public function store(Request $request, Hotel $hotel)
    {
        $request->validate([
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|max:5120',
        ]);

        $maxOrdre = $hotel->photos()->max('ordre') ?? -1;

        foreach ($request->file('photos') as $index => $photo) {
            $path = $photo->store("hotels/{$hotel->id}", 's3');
            Photo::create([
                'entite_type' => 'hotel',
                'entite_id' => $hotel->id,
                'url_photo' => $path,
                'ordre' => $maxOrdre + $index + 1,
                'est_principale' => false,
                'uploaded_by' => auth()->id(),
            ]);
        }

        $this->logAction('hotel_photos_added', "Photos ajoutées à l'hôtel {$hotel->nom}");

        return back()->with('success', 'Photos ajoutées avec succès.');
    }

    public function destroy(Hotel $hotel, $photoId)
    {
        $photo = Photo::forHotel($hotel->id)->where('id', $photoId)->firstOrFail();

        // Delete from S3
        $s3Path = str_starts_with($photo->url_photo, 'http')
            ? ltrim(parse_url($photo->url_photo, PHP_URL_PATH), '/')
            : $photo->url_photo;
        Storage::disk('s3')->delete($s3Path);

        $photo->delete();

        $this->logAction('hotel_photo_deleted', "Photo supprimée de l'hôtel {$hotel->nom}");

        return back()->with('success', 'Photo supprimée avec succès.');
    }
}
