<?php

namespace App\Http\Controllers\Hotel\Traits;

use App\Models\Hotel;
use App\Models\Propriete;

trait BelongsToHotel
{
    /**
     * Get the hotel associated with the authenticated user.
     */
    protected function getHotel(): Hotel
    {
        return Hotel::whereHas('admins', fn($q) => $q->where('user_id', auth()->id())->whereNull('date_fin'))
            ->firstOrFail();
    }

    /**
     * Get a propriete that belongs to the authenticated user's hotel.
     */
    protected function scopePropriete(int $proprieteId): Propriete
    {
        return Propriete::where('id', $proprieteId)
            ->where('hotel_id', $this->getHotel()->id)
            ->firstOrFail();
    }
}
