<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Photo;
use App\Models\Propriete;
use App\Traits\LogsAdminAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class RoomPhotoController extends Controller
{
    use BelongsToHotel, LogsAdminAction;

    public function store(Request $request, $proprieteId)
    {
        $propriete = $this->scopePropriete($proprieteId);

        $request->validate([
            'photos' => 'required|array',
            'photos.*' => 'image|max:5120',
        ]);

        $maxOrdre = $propriete->photos()->max('ordre') ?? 0;
        $isFirst = $propriete->photos()->count() === 0;

        foreach ($request->file('photos') as $i => $photo) {
            $path = $photo->store("proprietes/{$propriete->id}", 's3');
            Photo::create([
                'entite_type' => 'propriete',
                'entite_id' => $propriete->id,
                'url_photo' => $path,
                'ordre' => $maxOrdre + $i + 1,
                'est_principale' => $isFirst && $i === 0,
                'uploaded_by' => auth()->id(),
            ]);
        }

        return back()->with('success', 'Photos ajoutées avec succès.');
    }

    public function destroy($proprieteId, $photoId)
    {
        $propriete = $this->scopePropriete($proprieteId);
        $photo = Photo::forPropriete($propriete->id)->where('id', $photoId)->firstOrFail();

        Storage::disk('s3')->delete($photo->url_photo);
        $photo->delete();

        return back()->with('success', 'Photo supprimée.');
    }

    public function reorder(Request $request, $proprieteId)
    {
        $propriete = $this->scopePropriete($proprieteId);

        $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:photos,id',
        ]);

        foreach ($request->order as $index => $photoId) {
            Photo::forPropriete($propriete->id)->where('id', $photoId)->update(['ordre' => $index]);
        }

        return response()->json(['success' => true]);
    }
}
