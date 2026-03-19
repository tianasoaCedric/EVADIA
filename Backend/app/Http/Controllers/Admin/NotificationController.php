<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->where('canal', 'in_app')
            ->latest('date_envoi')
            ->paginate(20);

        return view('admin.notifications.index', compact('notifications'));
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

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
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
