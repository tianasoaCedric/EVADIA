<?php

namespace App\Observers;

use App\Models\Avis;
use App\Models\Hotel;
use Illuminate\Support\Facades\DB;

class AvisObserver
{
    public function created(Avis $avis): void
    {
        $this->recalculerNoteHotel($avis);
    }

    public function updated(Avis $avis): void
    {
        $this->recalculerNoteHotel($avis);
    }

    public function deleted(Avis $avis): void
    {
        $this->recalculerNoteHotel($avis);
    }

    private function recalculerNoteHotel(Avis $avis): void
    {
        $hotelId = DB::table('proprietes')
            ->where('id', $avis->propriete_id)
            ->value('hotel_id');

        if (! $hotelId) {
            return;
        }

        $stats = DB::table('avis')
            ->join('proprietes', 'avis.propriete_id', '=', 'proprietes.id')
            ->where('proprietes.hotel_id', $hotelId)
            ->selectRaw('ROUND(AVG(avis.note), 2) as moyenne, COUNT(*) as total')
            ->first();

        Hotel::where('id', $hotelId)->update([
            'note_moyenne' => $stats->moyenne ?? 0,
            'nb_avis'      => $stats->total ?? 0,
        ]);
    }
}
