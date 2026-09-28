<?php

namespace App\Http\Controllers\Hotel;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Hotel\Traits\BelongsToHotel;
use App\Models\Notification;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    use BelongsToHotel;

    public function index()
    {
        $hotel = $this->getHotel();
        $notifications = Notification::where('user_id', auth()->id())
            ->where('canal', 'in_app')
            ->latest('date_envoi')
            ->paginate(20);

        return view('hotel.notifications.index', compact('notifications', 'hotel'));
    }

    public function recent(): JsonResponse
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->where('canal', 'in_app')
            ->latest('date_envoi')
            ->take(10)
            ->get();

        $unreadCount = Notification::where('user_id', auth()->id())
            ->where('lu', false)
            ->count();

        // Demandes à traiter : badge sur « Réservations » dans la sidebar
        $reservationsEnAttente = Reservation::whereHas('propriete', fn($q) => $q->where('hotel_id', $this->getHotel()->id))
            ->where('statut', 'en_attente')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'reservations_en_attente' => $reservationsEnAttente,
        ]);
    }

    public function markAsRead(Notification $notification): JsonResponse
    {
        if ($notification->user_id !== auth()->id()) {
            abort(403);
        }

        $notification->update(['lu' => true, 'date_lecture' => now()]);

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(): JsonResponse
    {
        Notification::where('user_id', auth()->id())
            ->where('lu', false)
            ->update(['lu' => true, 'date_lecture' => now()]);

        return response()->json(['success' => true]);
    }
}
